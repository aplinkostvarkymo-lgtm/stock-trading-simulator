'use client'

import { useState, useEffect } from 'react'
import { LineChart, BarChart3 } from 'lucide-react'
import PriceDisplay from '@/components/ui/PriceDisplay'
import StockChart from '@/components/StockChart'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  open?: number
  high?: number
  low?: number
  previousClose?: number
}

interface Props {
  quote: StockQuote
  isLoading: boolean
}

export default function StockDetailsWithChart({ quote, isLoading }: Props) {
  const [chartData, setChartData] = useState<any[]>([])
  const [loadingChart, setLoadingChart] = useState(false)
  const [timeRange, setTimeRange] = useState<'1day' | '1week' | '1month'>('1week')
  const [showChart, setShowChart] = useState(true)

  useEffect(() => {
    if (quote?.symbol) {
      fetchChartData()
    }
  }, [quote?.symbol, timeRange])

  const fetchChartData = async () => {
    if (!quote?.symbol) return
    
    setLoadingChart(true)
    try {
      // Simulate fetching time series data
      // In production, you'd call: const response = await fetch(`/api/stocks/timeseries/${quote.symbol}?interval=${timeRange}`)
      
      // For now, generate sample data based on current price
      const basePrice = quote.price
      const dataPoints = timeRange === '1day' ? 7 : timeRange === '1week' ? 7 : 30
      const now = new Date()
      
      const data = Array.from({ length: dataPoints }, (_, i) => {
        const date = new Date(now)
        if (timeRange === '1day') {
          date.setHours(now.getHours() - (dataPoints - i))
        } else if (timeRange === '1week') {
          date.setDate(now.getDate() - (dataPoints - i))
        } else {
          date.setDate(now.getDate() - (dataPoints - i))
        }
        
        // Create realistic price variation
        const variation = (Math.random() - 0.5) * (basePrice * 0.02)
        const trend = (i / dataPoints) * quote.change
        
        return {
          datetime: date.toISOString(),
          price: basePrice + variation + trend,
        }
      })
      
      setChartData(data)
    } catch (error) {
      console.error('Chart data error:', error)
    } finally {
      setLoadingChart(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (!quote) {
    return null
  }

  return (
    <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
      <div className="space-y-6">
        {/* Stock Header */}
        <div>
          <h2 className="text-2xl font-bold text-terminal-text mb-1">{quote.symbol}</h2>
          <p className="text-terminal-muted">{quote.name}</p>
        </div>

        {/* Price Display */}
        <PriceDisplay
          price={quote.price}
          change={quote.change}
          changePercent={quote.changePercent}
          size="lg"
        />

        {/* Chart Toggle */}
        <div className="flex items-center gap-2 border-b border-terminal-border pb-4">
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-2 px-3 py-1.5 bg-terminal-bg hover:bg-terminal-border rounded-lg text-terminal-text text-sm transition-colors"
          >
            {showChart ? <BarChart3 className="w-4 h-4" /> : <LineChart className="w-4 h-4" />}
            {showChart ? 'Hide' : 'Show'} Chart
          </button>

          {showChart && (
            <div className="flex gap-1 ml-auto">
              {(['1day', '1week', '1month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    timeRange === range
                      ? 'bg-accent-blue text-white'
                      : 'bg-terminal-bg text-terminal-muted hover:text-terminal-text'
                  }`}
                >
                  {range === '1day' ? '1D' : range === '1week' ? '1W' : '1M'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        {showChart && (
          <div>
            {loadingChart ? (
              <div className="flex items-center justify-center h-[250px]">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <StockChart data={chartData} height={250} />
            )}
          </div>
        )}

        {/* Stock Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-terminal-border">
          <div>
            <p className="text-sm text-terminal-muted mb-1">Open</p>
            <p className="font-semibold text-terminal-text">
              ${quote.open?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-terminal-muted mb-1">Previous Close</p>
            <p className="font-semibold text-terminal-text">
              ${quote.previousClose?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-terminal-muted mb-1">High</p>
            <p className="font-semibold text-success-green">
              ${quote.high?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-terminal-muted mb-1">Low</p>
            <p className="font-semibold text-danger-red">
              ${quote.low?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-terminal-muted mb-1">Volume</p>
            <p className="font-semibold text-terminal-text">
              {quote.volume?.toLocaleString() || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

