import { env } from './env'

const TWELVEDATA_BASE_URL = 'https://api.twelvedata.com'
const API_KEY = env.TWELVEDATA_API_KEY

// Rate limiting: 8 calls per minute on free tier
let requestCount = 0
let lastResetTime = Date.now()

const checkRateLimit = () => {
  const now = Date.now()
  const oneMinute = 60 * 1000

  if (now - lastResetTime > oneMinute) {
    requestCount = 0
    lastResetTime = now
  }

  if (requestCount >= 8) {
    const waitTime = oneMinute - (now - lastResetTime)
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`)
  }

  requestCount++
}

// Retry logic with exponential backoff
const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      checkRateLimit()
      
      const response = await fetch(url, {
        next: { revalidate: 60 }, // Cache for 60 seconds
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded')
        }
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Check for API error messages
      if (data.status === 'error') {
        throw new Error(data.message || 'API error')
      }

      return data
    } catch (error) {
      if (i === retries - 1) throw error
      
      // Exponential backoff: wait 2^i seconds
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}

export interface StockSearchResult {
  symbol: string
  instrument_name: string
  exchange: string
  instrument_type: string
  country: string
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: string
  previousClose?: number
  open?: number
  high?: number
  low?: number
}

export interface TimeSeriesData {
  datetime: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Search for stocks by symbol or company name
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const url = `${TWELVEDATA_BASE_URL}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${API_KEY}`
    const data = await fetchWithRetry(url)
    
    return data.data || []
  } catch (error) {
    console.error('Stock search error:', error)
    return []
  }
}

/**
 * Get real-time quote for a single stock
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  if (!symbol || !/^[A-Z]{1,5}$/.test(symbol.toUpperCase())) {
    throw new Error('Invalid symbol format')
  }

  try {
    const url = `${TWELVEDATA_BASE_URL}/quote?symbol=${symbol.toUpperCase()}&apikey=${API_KEY}`
    const data = await fetchWithRetry(url)

    if (!data || !data.symbol) {
      return null
    }

    // Calculate change and change percent
    const price = parseFloat(data.close || data.price || '0')
    const previousClose = parseFloat(data.previous_close || '0')
    const change = price - previousClose
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

    return {
      symbol: data.symbol,
      name: data.name || symbol,
      price: price,
      change: change,
      changePercent: changePercent,
      volume: parseInt(data.volume || '0'),
      timestamp: data.datetime || new Date().toISOString(),
      previousClose: previousClose,
      open: parseFloat(data.open || '0'),
      high: parseFloat(data.high || '0'),
      low: parseFloat(data.low || '0'),
    }
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    throw error
  }
}

/**
 * Get quotes for multiple stocks using INDIVIDUAL requests
 * Free tier does not support batch requests reliably
 * Returns both quotes and any error information
 * GUARANTEED to return a valid object, never undefined
 */
export async function getBatchQuotes(
  symbols: string[]
): Promise<{ quotes: Map<string, StockQuote>; error?: string }> {
  // CRITICAL: Initialize return value to prevent undefined
  const quotes = new Map<string, StockQuote>()

  // Validate input
  if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
    return { quotes }
  }
  
  let successCount = 0
  let errorCount = 0
  let lastError = ''

  // Fetch each symbol individually for better reliability on free tier
  for (const symbol of symbols) {
    try {
      const url = `${TWELVEDATA_BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`
      const data = await fetchWithRetry(url)

      // Check for API error responses
      if (data.status === 'error') {
        const errorMsg = data.message || 'Unknown API error'
        console.error(`[TwelveData] API Error for ${symbol}:`, errorMsg)
        lastError = errorMsg
        errorCount++
        continue
      }

      // Extract price - TwelveData uses 'close' for real-time quotes
      const price = parseFloat(data.close || data.price || '0')
      
      if (price === 0 || !price) {
        console.error(`[TwelveData] ✗ ${symbol}: Price is 0 or invalid. Raw data:`, data)
        lastError = `No valid price returned for ${symbol}`
        errorCount++
        continue
      }
      
      const previousClose = parseFloat(data.previous_close || '0')
      const change = price - previousClose
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

      quotes.set(symbol, {
        symbol: data.symbol || symbol,
        name: data.name || symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: parseInt(data.volume || '0'),
        timestamp: data.datetime || new Date().toISOString(),
        previousClose: previousClose,
        open: parseFloat(data.open || '0'),
        high: parseFloat(data.high || '0'),
        low: parseFloat(data.low || '0'),
      })
      
      successCount++
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[TwelveData] ✗ Failed to fetch ${symbol}:`, errorMsg)
      lastError = errorMsg
      errorCount++
      
      // Check for rate limit
      if (errorMsg.includes('429') || errorMsg.includes('Rate limit')) {
        return { 
          quotes, 
          error: 'API Rate Limit Reached (8 calls/minute on free tier). Wait 60 seconds and refresh.' 
        }
      }
    }
  }
  
  // If ALL requests failed, return error
  if (quotes.size === 0 && errorCount > 0) {
    return { 
      quotes, 
      error: `TwelveData API Failed: ${lastError || 'All symbols returned 0 quotes'}` 
    }
  }
  
  // If SOME requests failed, add warning but don't block
  if (errorCount > 0 && quotes.size > 0) {
    return { 
      quotes, 
      error: `Partial failure: ${errorCount} of ${symbols.length} symbols failed` 
    }
  }
  
  return { quotes }
}

/**
 * Get historical time series data
 */
export async function getTimeSeries(
  symbol: string,
  interval: '1min' | '5min' | '15min' | '1h' | '1day' = '1day',
  outputSize: number = 30
): Promise<TimeSeriesData[]> {
  if (!symbol) {
    throw new Error('Symbol is required')
  }

  try {
    const url = `${TWELVEDATA_BASE_URL}/time_series?symbol=${symbol.toUpperCase()}&interval=${interval}&outputsize=${outputSize}&apikey=${API_KEY}`
    const data = await fetchWithRetry(url)

    if (!data.values || !Array.isArray(data.values)) {
      return []
    }

    return data.values.map((item: any) => ({
      datetime: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume || '0'),
    }))
  } catch (error) {
    console.error(`Time series error for ${symbol}:`, error)
    return []
  }
}

/**
 * Get historical price for a specific date
 * Returns the closest available price if exact date is not available (e.g., weekends, holidays)
 */
export async function getHistoricalPrice(
  symbol: string,
  date: string // Format: YYYY-MM-DD
): Promise<{ price: number; date: string; open: number; high: number; low: number; close: number } | null> {
  if (!symbol || !date) {
    throw new Error('Symbol and date are required')
  }

  try {
    // Fetch time series data starting from the target date
    // We fetch more data to ensure we get the closest available date
    const targetDate = new Date(date)
    const today = new Date()
    const daysDiff = Math.ceil((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Limit to reasonable range (max 5 years of daily data)
    const outputSize = Math.min(Math.max(daysDiff + 10, 30), 1825)

    const url = `${TWELVEDATA_BASE_URL}/time_series?symbol=${symbol.toUpperCase()}&interval=1day&outputsize=${outputSize}&apikey=${API_KEY}`
    const data = await fetchWithRetry(url)

    if (!data.values || !Array.isArray(data.values) || data.values.length === 0) {
      return null
    }

    // Find the closest date to the target date (on or before)
    const targetTime = targetDate.getTime()
    let closestData = null
    let closestDiff = Infinity

    for (const item of data.values) {
      const itemDate = new Date(item.datetime)
      const itemTime = itemDate.getTime()
      
      // Only consider dates on or before the target date
      if (itemTime <= targetTime) {
        const diff = targetTime - itemTime
        if (diff < closestDiff) {
          closestDiff = diff
          closestData = item
        }
      }
    }

    if (!closestData) {
      // If no date found before target, use the oldest available
      closestData = data.values[data.values.length - 1]
    }

    return {
      price: parseFloat(closestData.close),
      date: closestData.datetime,
      open: parseFloat(closestData.open),
      high: parseFloat(closestData.high),
      low: parseFloat(closestData.low),
      close: parseFloat(closestData.close),
    }
  } catch (error) {
    console.error(`Historical price error for ${symbol} on ${date}:`, error)
    return null
  }
}

/**
 * Get time series data between two dates for Time Machine feature
 */
export async function getTimeSeriesRange(
  symbol: string,
  startDate: string, // Format: YYYY-MM-DD
  endDate?: string // Format: YYYY-MM-DD (defaults to today)
): Promise<TimeSeriesData[]> {
  if (!symbol || !startDate) {
    throw new Error('Symbol and start date are required')
  }

  try {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date()
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    // Limit to reasonable range
    const outputSize = Math.min(Math.max(daysDiff + 5, 30), 1825)

    const url = `${TWELVEDATA_BASE_URL}/time_series?symbol=${symbol.toUpperCase()}&interval=1day&outputsize=${outputSize}&apikey=${API_KEY}`
    const data = await fetchWithRetry(url)

    if (!data.values || !Array.isArray(data.values)) {
      return []
    }

    // Filter data to only include dates within range
    const startTime = start.getTime()
    const endTime = end.getTime()

    const filtered = data.values
      .filter((item: any) => {
        const itemTime = new Date(item.datetime).getTime()
        return itemTime >= startTime && itemTime <= endTime
      })
      .map((item: any) => ({
        datetime: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume || '0'),
      }))
      .reverse() // Reverse to get chronological order (oldest to newest)

    return filtered
  } catch (error) {
    console.error(`Time series range error for ${symbol}:`, error)
    return []
  }
}

