'use client'

import { useState, useEffect } from 'react'
import { getWatchlist, removeFromWatchlist, addToWatchlist } from '@/app/actions/watchlist'
import { Star, Search, X, TrendingUp, TrendingDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'
import { ToastContainer } from '@/components/ui/Toast'

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [toasts, setToasts] = useState<any[]>([])

  useEffect(() => {
    loadWatchlist()
  }, [])

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchStocks()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  const loadWatchlist = async () => {
    setLoading(true)
    const result = await getWatchlist()
    if (result.success) {
      setWatchlist(result.data)
    }
    setLoading(false)
  }

  const searchStocks = async () => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.data.slice(0, 5))
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToWatchlist = async (stock: any) => {
    const result = await addToWatchlist(stock.symbol, stock.instrument_name)
    if (result.success) {
      addToast('success', result.data.message)
      setSearchQuery('')
      setSearchResults([])
      loadWatchlist()
    } else {
      addToast('error', result.error || 'Failed to add to watchlist')
    }
  }

  const handleRemove = async (symbol: string) => {
    const result = await removeFromWatchlist(symbol)
    if (result.success) {
      addToast('success', result.data.message)
      loadWatchlist()
    } else {
      addToast('error', result.error || 'Failed to remove from watchlist')
    }
  }

  const addToast = (type: any, message: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev: any[]) => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts((prev: any[]) => prev.filter((t: any) => t.id !== id))
  }

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div>
        <h1 className="text-3xl font-bold text-terminal-text mb-2">Watchlist</h1>
        <p className="text-terminal-muted">Track your favorite stocks</p>
      </div>

      {/* Add to Watchlist */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-terminal-text mb-4">Add Stock to Watchlist</h2>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
          <input
            type="text"
            placeholder="Search stocks by symbol or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-colors"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border border-terminal-border rounded-lg overflow-hidden">
            {searchResults.map((stock: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-terminal-bg transition-colors border-b border-terminal-border/50 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-terminal-text">{stock.symbol}</p>
                  <p className="text-sm text-terminal-muted">{stock.instrument_name}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddToWatchlist(stock)}
                >
                  <Star className="w-4 h-4" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist Table */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-terminal-text mb-6">Your Watchlist</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-terminal-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-terminal-text mb-2">No Stocks in Watchlist</h3>
            <p className="text-terminal-muted">Add stocks to track their performance</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-terminal-muted text-sm border-b border-terminal-border">
                  <th className="pb-3 font-semibold">Symbol</th>
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold text-right">Price</th>
                  <th className="pb-3 font-semibold text-right">Change</th>
                  <th className="pb-3 font-semibold text-right">Change %</th>
                  <th className="pb-3 font-semibold text-right">Volume</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item: any) => (
                  <tr key={item.id} className="border-b border-terminal-border/50 hover:bg-terminal-bg/50">
                    <td className="py-4 text-terminal-text font-bold">{item.symbol}</td>
                    <td className="py-4 text-terminal-muted">{item.companyName}</td>
                    <td className="py-4 text-right text-terminal-text font-semibold">
                      ${item.currentPrice?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="py-4 text-right">
                      <span className={item.change >= 0 ? 'text-success-green' : 'text-danger-red'}>
                        {item.change >= 0 && '+'}{item.change?.toFixed(2) || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${item.changePercent >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                        {item.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="font-semibold">
                          {item.changePercent >= 0 && '+'}{item.changePercent?.toFixed(2) || 'N/A'}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right text-terminal-muted">
                      {item.volume?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/dashboard/trade"
                          className="text-accent-blue hover:underline text-sm font-medium"
                        >
                          Trade
                        </Link>
                        <button
                          onClick={() => handleRemove(item.symbol)}
                          className="text-danger-red hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

