'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { getHistoricalPrice, getStockQuote, getTimeSeriesRange } from '@/lib/stock-api'

interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch historical price for a specific stock and date
 * Used for auto-fetching when user selects symbol + date
 */
export async function fetchHistoricalPrice(
  symbol: string,
  date: string
): Promise<ActionResponse<{ 
  historicalPrice: number
  actualDate: string
  historicalData: {
    open: number
    high: number
    low: number
    close: number
  }
}>> {
  try {
    // Validate input
    if (!symbol || symbol.length < 1 || symbol.length > 5) {
      return { success: false, error: 'Invalid stock symbol' }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: false, error: 'Invalid date format' }
    }

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    // Validate date is in the past
    const investmentDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (investmentDate >= today) {
      return { success: false, error: 'Date must be in the past.' }
    }

    // Check if date is too far back
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    
    if (investmentDate < fiveYearsAgo) {
      return { 
        success: false, 
        error: 'Date is too far back. Please select a date within the last 5 years.' 
      }
    }

    // Fetch historical price
    const historicalData = await getHistoricalPrice(symbol.toUpperCase(), date)
    
    if (!historicalData) {
      return { 
        success: false, 
        error: `Unable to fetch historical data for ${symbol.toUpperCase()}. The stock may not have existed on that date or data is unavailable.` 
      }
    }

    return {
      success: true,
      data: {
        historicalPrice: historicalData.price,
        actualDate: historicalData.date,
        historicalData: {
          open: historicalData.open,
          high: historicalData.high,
          low: historicalData.low,
          close: historicalData.close,
        }
      }
    }
  } catch (error) {
    console.error('Fetch historical price error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to fetch historical price' }
  }
}

/**
 * Fetch current price for a stock
 * Used for auto-updating current value
 */
export async function fetchCurrentPrice(
  symbol: string
): Promise<ActionResponse<{ 
  currentPrice: number
  companyName: string
}>> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    const quote = await getStockQuote(symbol.toUpperCase())
    
    if (!quote) {
      return { 
        success: false, 
        error: `Unable to fetch current price for ${symbol.toUpperCase()}.` 
      }
    }

    return {
      success: true,
      data: {
        currentPrice: quote.price,
        companyName: quote.name
      }
    }
  } catch (error) {
    console.error('Fetch current price error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to fetch current price' }
  }
}

const simulationSchema = z.object({
  symbol: z.string().min(1).max(5).toUpperCase(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  amount: z.number().min(1).max(1000000),
})

interface SimulationResult {
  symbol: string
  companyName: string
  investmentDate: string
  actualDate: string // May differ if market was closed
  investmentAmount: number
  historicalPrice: number
  currentPrice: number
  sharesBought: number
  currentValue: number
  totalProfit: number
  totalProfitPercent: number
  historicalData: {
    open: number
    high: number
    low: number
    close: number
  }
  chartData: Array<{
    datetime: string
    price: number
  }>
}

/**
 * Simulate a past investment and calculate its current value
 */
export async function simulateInvestment(
  symbol: string,
  date: string,
  amount: number
): Promise<ActionResponse<SimulationResult>> {
  try {
    // Validate input
    const validated = simulationSchema.parse({ symbol, date, amount })

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    // Validate date is in the past
    const investmentDate = new Date(validated.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (investmentDate >= today) {
      return { success: false, error: 'Investment date must be in the past.' }
    }

    // Check if date is too far back (limit to 5 years for free tier)
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    
    if (investmentDate < fiveYearsAgo) {
      return { 
        success: false, 
        error: 'Date is too far back. Please select a date within the last 5 years.' 
      }
    }

    // Fetch historical price for the investment date
    const historicalData = await getHistoricalPrice(validated.symbol, validated.date)
    
    if (!historicalData) {
      return { 
        success: false, 
        error: `Unable to fetch historical data for ${validated.symbol}. The stock may not have existed on that date or data is unavailable.` 
      }
    }

    // Fetch current price
    const currentQuote = await getStockQuote(validated.symbol)
    
    if (!currentQuote) {
      return { 
        success: false, 
        error: `Unable to fetch current price for ${validated.symbol}.` 
      }
    }

    // Calculate investment results
    const historicalPrice = historicalData.price
    const currentPrice = currentQuote.price
    const sharesBought = validated.amount / historicalPrice
    const currentValue = sharesBought * currentPrice
    const totalProfit = currentValue - validated.amount
    const totalProfitPercent = (totalProfit / validated.amount) * 100

    // Fetch chart data from investment date to today
    const chartDataRaw = await getTimeSeriesRange(
      validated.symbol,
      historicalData.date, // Use actual date (may be adjusted for weekends)
      today.toISOString().split('T')[0]
    )

    // Transform chart data for display
    const chartData = chartDataRaw.map(item => ({
      datetime: item.datetime,
      price: item.close,
    }))

    const result: SimulationResult = {
      symbol: validated.symbol,
      companyName: currentQuote.name,
      investmentDate: validated.date,
      actualDate: historicalData.date,
      investmentAmount: validated.amount,
      historicalPrice: historicalPrice,
      currentPrice: currentPrice,
      sharesBought: sharesBought,
      currentValue: currentValue,
      totalProfit: totalProfit,
      totalProfitPercent: totalProfitPercent,
      historicalData: {
        open: historicalData.open,
        high: historicalData.high,
        low: historicalData.low,
        close: historicalData.close,
      },
      chartData: chartData,
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('Time machine simulation error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to simulate investment' }
  }
}

