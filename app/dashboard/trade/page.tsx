'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, Package, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { buyStock, sellStock, getUserBalance, getHoldings } from '@/app/actions/trade'
import { ToastContainer } from '@/components/ui/Toast'
import StockDetailsWithChart from './StockDetailsWithChart'

export default function TradePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [stockQuote, setStockQuote] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [balance, setBalance] = useState(0)
  const [holdings, setHoldings] = useState<any[]>([])
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(true)
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState(1)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [toasts, setToasts] = useState<any[]>([])

  useEffect(() => {
    loadBalance()
    loadHoldings()
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

  const loadBalance = async () => {
    const result = await getUserBalance()
    if (result.success && result.data !== undefined) {
      setBalance(result.data)
    }
  }

  const loadHoldings = async () => {
    setIsLoadingHoldings(true)
    try {
      const result = await getHoldings()
      if (result.success) {
        setHoldings(result.data)
      }
    } catch (error) {
      console.error('Failed to load holdings:', error)
    } finally {
      setIsLoadingHoldings(false)
    }
  }

  const searchStocks = async () => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.data.slice(0, 10))
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectStock = async (stock: any) => {
    setSelectedStock(stock)
    setSearchResults([])
    setSearchQuery('')
    setIsLoadingQuote(true)

    try {
      const response = await fetch(`/api/stocks/quote/${stock.symbol}`)
      const data = await response.json()
      if (data.success) {
        setStockQuote(data.data)
      }
    } catch (error) {
      console.error('Quote error:', error)
      addToast('error', 'Failed to fetch stock quote')
    } finally {
      setIsLoadingQuote(false)
    }
  }

  const handleTrade = async () => {
    if (!stockQuote) return

    setIsExecuting(true)
    setShowConfirmModal(false)

    try {
      const result = activeTab === 'buy'
        ? await buyStock(stockQuote.symbol, quantity)
        : await sellStock(stockQuote.symbol, quantity)

      if (result.success) {
        addToast('success', result.data.message)
        loadBalance()
        loadHoldings() // Refresh holdings after trade
        setQuantity(1)
        // Refresh quote
        const response = await fetch(`/api/stocks/quote/${stockQuote.symbol}`)
        const data = await response.json()
        if (data.success) {
          setStockQuote(data.data)
        }
      } else {
        addToast('error', result.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Trade error:', error)
      addToast('error', 'An unexpected error occurred')
    } finally {
      setIsExecuting(false)
    }
  }

  const addToast = (type: any, message: string) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev: any[]) => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts((prev: any[]) => prev.filter((t: any) => t.id !== id))
  }

  const totalCost = stockQuote ? stockQuote.price * quantity : 0
  const canAfford = balance >= totalCost

  // Check current position for selected stock
  const currentPosition = selectedStock
    ? holdings.find((h) => h.symbol === selectedStock.symbol)
    : null

  const canSell = currentPosition && currentPosition.quantity >= quantity

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div>
        <h1 className="text-3xl font-bold text-terminal-text mb-2">Trade Stocks</h1>
        <p className="text-terminal-muted">Search for stocks and execute trades instantly</p>
      </div>

      {/* Search Bar */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
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
              <button
                key={index}
                onClick={() => selectStock(stock)}
                className="w-full flex items-center justify-between p-4 hover:bg-terminal-bg transition-colors text-left border-b border-terminal-border/50 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-terminal-text">{stock.symbol}</p>
                  <p className="text-sm text-terminal-muted">{stock.instrument_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-terminal-muted">{stock.exchange}</p>
                  <p className="text-xs text-terminal-muted">{stock.country}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Your Portfolio Section */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-terminal-text flex items-center gap-2">
            <Package className="w-5 h-5" />
            Your Portfolio
          </h2>
          <button
            onClick={loadHoldings}
            className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
            disabled={isLoadingHoldings}
          >
            {isLoadingHoldings ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {isLoadingHoldings ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-terminal-muted mx-auto mb-3 opacity-50" />
            <p className="text-terminal-muted">No holdings yet. Start trading to build your portfolio!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-terminal-border">
                  <th className="text-left py-3 text-terminal-muted font-semibold text-sm">Symbol</th>
                  <th className="text-left py-3 text-terminal-muted font-semibold text-sm">Company</th>
                  <th className="text-right py-3 text-terminal-muted font-semibold text-sm">Quantity</th>
                  <th className="text-right py-3 text-terminal-muted font-semibold text-sm">Avg Price</th>
                  <th className="text-right py-3 text-terminal-muted font-semibold text-sm">Total Cost</th>
                  <th className="text-center py-3 text-terminal-muted font-semibold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding: any) => (
                  <tr
                    key={holding.id}
                    className="border-b border-terminal-border/50 hover:bg-terminal-bg/50 transition-colors"
                  >
                    <td className="py-4">
                      <span className="font-bold text-terminal-text">{holding.symbol}</span>
                    </td>
                    <td className="py-4 text-terminal-text text-sm">{holding.companyName}</td>
                    <td className="py-4 text-right text-terminal-text font-semibold">
                      {holding.quantity}
                    </td>
                    <td className="py-4 text-right text-terminal-text">
                      ${holding.averagePrice.toFixed(2)}
                    </td>
                    <td className="py-4 text-right text-terminal-text font-semibold">
                      ${(holding.averagePrice * holding.quantity).toFixed(2)}
                    </td>
                    <td className="py-4 text-center">
                      <button
                        onClick={async () => {
                          // Search for this stock to populate the trade form
                          setSelectedStock({
                            symbol: holding.symbol,
                            instrument_name: holding.companyName,
                          })
                          setActiveTab('sell')
                          setIsLoadingQuote(true)
                          try {
                            const response = await fetch(`/api/stocks/quote/${holding.symbol}`)
                            const data = await response.json()
                            if (data.success) {
                              setStockQuote(data.data)
                            }
                          } catch (error) {
                            console.error('Quote error:', error)
                            addToast('error', 'Failed to fetch stock quote')
                          } finally {
                            setIsLoadingQuote(false)
                          }
                        }}
                        className="px-3 py-1 bg-danger-red hover:bg-danger-red/80 text-white text-sm font-semibold rounded transition-colors"
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Details & Trading Panel */}
      {selectedStock && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Stock Details with Chart */}
          <StockDetailsWithChart quote={stockQuote} isLoading={isLoadingQuote} />

          {/* Trading Panel */}
          <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-terminal-text mb-4">Place Order</h2>

            {/* BUY/SELL Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('buy')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  activeTab === 'buy'
                    ? 'bg-success-green text-white'
                    : 'bg-terminal-bg text-terminal-muted hover:text-terminal-text'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  activeTab === 'sell'
                    ? 'bg-danger-red text-white'
                    : 'bg-terminal-bg text-terminal-muted hover:text-terminal-text'
                }`}
              >
                SELL
              </button>
            </div>

            {stockQuote && (
              <div className="space-y-4">
                {/* Current Position Alert */}
                {currentPosition && (
                  <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-accent-blue mb-1">Current Position</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-terminal-text">
                          <div>
                            <span className="text-terminal-muted">Shares Owned:</span>{' '}
                            <span className="font-semibold">{currentPosition.quantity}</span>
                          </div>
                          <div>
                            <span className="text-terminal-muted">Avg Price:</span>{' '}
                            <span className="font-semibold">${currentPosition.averagePrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-terminal-text mb-2">
                    Quantity
                    {activeTab === 'sell' && currentPosition && (
                      <span className="ml-2 text-xs text-terminal-muted">
                        (Max: {currentPosition.quantity})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={activeTab === 'sell' && currentPosition ? currentPosition.quantity : undefined}
                    value={quantity}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1)
                      if (activeTab === 'sell' && currentPosition) {
                        setQuantity(Math.min(val, currentPosition.quantity))
                      } else {
                        setQuantity(val)
                      }
                    }}
                    className="w-full px-4 py-2 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none"
                  />
                </div>

                {/* Price Info */}
                <div className="bg-terminal-bg rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-terminal-muted">Price per share</span>
                    <span className="text-terminal-text font-semibold">${stockQuote.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-terminal-muted">Quantity</span>
                    <span className="text-terminal-text font-semibold">{quantity}</span>
                  </div>
                  <div className="border-t border-terminal-border pt-2 flex justify-between">
                    <span className="text-terminal-text font-semibold">Total {activeTab === 'buy' ? 'Cost' : 'Proceeds'}</span>
                    <span className="text-accent-blue font-bold text-lg">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                {/* Balance Info */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-terminal-muted">Available Balance</span>
                  <span className="text-terminal-text font-semibold">${balance.toFixed(2)}</span>
                </div>

                {/* Warnings */}
                {activeTab === 'buy' && !canAfford && (
                  <div className="bg-danger-red/10 border border-danger-red/30 rounded-lg p-3 text-danger-red text-sm">
                    <strong>Insufficient balance.</strong> You need ${totalCost.toFixed(2)} but only have ${balance.toFixed(2)}.
                  </div>
                )}

                {activeTab === 'sell' && !currentPosition && (
                  <div className="bg-warning-yellow/10 border border-warning-yellow/30 rounded-lg p-3 text-warning-yellow text-sm">
                    <strong>No shares owned.</strong> You don't own any shares of {selectedStock.symbol}. Switch to BUY to purchase.
                  </div>
                )}

                {activeTab === 'sell' && currentPosition && !canSell && (
                  <div className="bg-danger-red/10 border border-danger-red/30 rounded-lg p-3 text-danger-red text-sm">
                    <strong>Insufficient shares.</strong> You only own {currentPosition.quantity} shares but trying to sell {quantity}.
                  </div>
                )}

                {/* Execute Button */}
                <Button
                  variant={activeTab === 'buy' ? 'success' : 'danger'}
                  size="lg"
                  className="w-full"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={
                    isExecuting ||
                    (activeTab === 'buy' && !canAfford) ||
                    (activeTab === 'sell' && (!currentPosition || !canSell))
                  }
                  loading={isExecuting}
                >
                  <TrendingUp className="w-5 h-5" />
                  {activeTab === 'buy' ? 'Buy Stock' : 'Sell Stock'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Order"
        size="sm"
      >
        {stockQuote && (
          <div className="space-y-4">
            <p className="text-terminal-muted">
              Are you sure you want to {activeTab} {quantity} shares of {stockQuote.symbol}?
            </p>
            
            <div className="bg-terminal-bg rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-terminal-muted">Action</span>
                <span className={`font-semibold ${activeTab === 'buy' ? 'text-success-green' : 'text-danger-red'}`}>
                  {activeTab.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted">Stock</span>
                <span className="text-terminal-text font-semibold">{stockQuote.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted">Quantity</span>
                <span className="text-terminal-text font-semibold">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-terminal-muted">Price</span>
                <span className="text-terminal-text font-semibold">${stockQuote.price.toFixed(2)}</span>
              </div>
              <div className="border-t border-terminal-border pt-2 flex justify-between">
                <span className="text-terminal-text font-semibold">Total</span>
                <span className="text-accent-blue font-bold">${totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant={activeTab === 'buy' ? 'success' : 'danger'}
                className="flex-1"
                onClick={handleTrade}
                loading={isExecuting}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

