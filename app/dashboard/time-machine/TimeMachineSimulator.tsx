'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, DollarSign, TrendingUp, TrendingDown, Clock, Star, Loader2, AlertCircle, ShoppingCart } from 'lucide-react'
import Button from '@/components/ui/Button'
import StockChart from '@/components/StockChart'
import Modal from '@/components/ui/Modal'
import { fetchHistoricalPrice, fetchCurrentPrice, simulateInvestment } from '@/app/actions/time-machine'
import { addToWatchlist } from '@/app/actions/watchlist'
import { executeBackdatedPurchase } from '@/app/actions/trade'
import { format } from 'date-fns'

interface SimulationResult {
  symbol: string
  companyName: string
  investmentDate: string
  actualDate: string
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

export default function TimeMachineSimulator() {
  // Form inputs
  const [symbol, setSymbol] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('10000')
  
  // Auto-fetched data
  const [companyName, setCompanyName] = useState('')
  const [historicalPrice, setHistoricalPrice] = useState<number | null>(null)
  const [actualDate, setActualDate] = useState('')
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  
  // Calculated values
  const [sharesBought, setSharesBought] = useState<number | null>(null)
  const [currentValue, setCurrentValue] = useState<number | null>(null)
  const [totalProfit, setTotalProfit] = useState<number | null>(null)
  const [totalProfitPercent, setTotalProfitPercent] = useState<number | null>(null)
  
  // UI state
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFetchingHistorical, setIsFetchingHistorical] = useState(false)
  const [isFetchingCurrent, setIsFetchingCurrent] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [error, setError] = useState('')
  const [historicalError, setHistoricalError] = useState('')
  
  // Full simulation result (for chart)
  const [fullResult, setFullResult] = useState<SimulationResult | null>(null)
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false)
  
  // Purchase confirmation
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false)
  const [isExecutingPurchase, setIsExecutingPurchase] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState('')

  // Get date constraints
  const today = new Date()
  const maxDate = today.toISOString().split('T')[0]
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
  const minDate = fiveYearsAgo.toISOString().split('T')[0]

  // Stock symbol autocomplete
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (symbol.length >= 2) {
        searchStocks()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [symbol])

  // Auto-fetch historical price when symbol AND date are filled
  useEffect(() => {
    if (symbol.length >= 1 && date) {
      autoFetchHistoricalPrice()
    } else {
      setHistoricalPrice(null)
      setActualDate('')
      setHistoricalError('')
    }
  }, [symbol, date])

  // Auto-fetch current price when symbol is filled
  useEffect(() => {
    if (symbol.length >= 1) {
      autoFetchCurrentPrice()
    } else {
      setCurrentPrice(null)
      setCompanyName('')
    }
  }, [symbol])

  // Auto-calculate values when inputs change
  useEffect(() => {
    if (historicalPrice && currentPrice && amount) {
      const amountNum = parseFloat(amount)
      if (!isNaN(amountNum) && amountNum > 0) {
        const shares = amountNum / historicalPrice
        const value = shares * currentPrice
        const profit = value - amountNum
        const profitPercent = (profit / amountNum) * 100

        setSharesBought(shares)
        setCurrentValue(value)
        setTotalProfit(profit)
        setTotalProfitPercent(profitPercent)
      } else {
        resetCalculations()
      }
    } else {
      resetCalculations()
    }
  }, [historicalPrice, currentPrice, amount])

  const resetCalculations = () => {
    setSharesBought(null)
    setCurrentValue(null)
    setTotalProfit(null)
    setTotalProfitPercent(null)
  }

  const searchStocks = async () => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(symbol)}`)
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

  const selectStock = (stock: any) => {
    setSymbol(stock.symbol)
    setSearchResults([])
    setError('')
    setHistoricalError('')
  }

  const autoFetchHistoricalPrice = async () => {
    setIsFetchingHistorical(true)
    setHistoricalError('')
    setHistoricalPrice(null)
    
    try {
      const response = await fetchHistoricalPrice(symbol.toUpperCase(), date)
      
      if (response.success && response.data) {
        setHistoricalPrice(response.data.historicalPrice)
        setActualDate(response.data.actualDate)
      } else {
        setHistoricalError(response.error || 'Failed to fetch historical price')
        setHistoricalPrice(null)
        setActualDate('')
      }
    } catch (err) {
      console.error('Historical price fetch error:', err)
      setHistoricalError('An error occurred while fetching historical price')
    } finally {
      setIsFetchingHistorical(false)
    }
  }

  const autoFetchCurrentPrice = async () => {
    setIsFetchingCurrent(true)
    
    try {
      const response = await fetchCurrentPrice(symbol.toUpperCase())
      
      if (response.success && response.data) {
        setCurrentPrice(response.data.currentPrice)
        setCompanyName(response.data.companyName)
      } else {
        setCurrentPrice(null)
        setCompanyName('')
      }
    } catch (err) {
      console.error('Current price fetch error:', err)
      setCurrentPrice(null)
    } finally {
      setIsFetchingCurrent(false)
    }
  }

  const handleViewChart = async () => {
    setError('')
    
    if (!symbol || !date || !amount || !historicalPrice || !currentPrice) {
      setError('Please complete all fields and wait for prices to load')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > 1000000) {
      setError('Please enter a valid investment amount between $1 and $1,000,000')
      return
    }

    setIsSimulating(true)

    try {
      const response = await simulateInvestment(symbol.toUpperCase(), date, amountNum)
      
      if (response.success && response.data) {
        setFullResult(response.data)
        setError('')
      } else {
        setError(response.error || 'Simulation failed')
        setFullResult(null)
      }
    } catch (err) {
      console.error('Simulation error:', err)
      setError('An unexpected error occurred')
      setFullResult(null)
    } finally {
      setIsSimulating(false)
    }
  }

  const handleAddToWatchlist = async () => {
    if (!symbol || !companyName) return

    setIsAddingToWatchlist(true)
    try {
      const response = await addToWatchlist(symbol, companyName)
      if (response.success) {
        alert(`${symbol} added to watchlist!`)
      } else {
        alert(response.error || 'Failed to add to watchlist')
      }
    } catch (error) {
      console.error('Add to watchlist error:', error)
      alert('Failed to add to watchlist')
    } finally {
      setIsAddingToWatchlist(false)
    }
  }

  const handleReset = () => {
    setSymbol('')
    setDate('')
    setAmount('10000')
    setHistoricalPrice(null)
    setCurrentPrice(null)
    setCompanyName('')
    setActualDate('')
    setFullResult(null)
    setError('')
    setHistoricalError('')
    setPurchaseSuccess('')
    resetCalculations()
  }

  const handleExecutePurchase = async () => {
    setShowPurchaseConfirm(false)
    
    if (!symbol || !amount || !date || !historicalPrice || !companyName || !actualDate) {
      setError('Missing required data for purchase')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Invalid investment amount')
      return
    }

    setIsExecutingPurchase(true)
    setError('')
    setPurchaseSuccess('')

    try {
      const response = await executeBackdatedPurchase(
        symbol.toUpperCase(),
        amountNum,
        actualDate, // Use actual date (adjusted for weekends)
        historicalPrice,
        companyName
      )

      if (response.success && response.data) {
        setPurchaseSuccess(response.data.message)
        setError('')
        
        // Auto-reset after 3 seconds to encourage new simulation
        setTimeout(() => {
          handleReset()
        }, 3000)
      } else {
        setError(response.error || 'Purchase failed')
        setPurchaseSuccess('')
      }
    } catch (err) {
      console.error('Purchase execution error:', err)
      setError('An unexpected error occurred during purchase')
      setPurchaseSuccess('')
    } finally {
      setIsExecutingPurchase(false)
    }
  }

  const canViewChart = symbol && date && amount && historicalPrice && currentPrice && !historicalError
  const canPurchase = symbol && date && amount && historicalPrice && actualDate && !historicalError && !isExecutingPurchase && !purchaseSuccess

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-terminal-text mb-6">Investment Simulator</h2>
        
        <div className="space-y-6">
          {/* Stock Symbol Input with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Stock Symbol *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, TSLA, MSFT"
                className="w-full pl-10 pr-4 py-3 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none placeholder:text-terminal-muted"
              />
              {isFetchingCurrent && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-blue animate-spin" />
              )}
            </div>
            {companyName && (
              <p className="text-sm text-terminal-muted mt-1">{companyName}</p>
            )}

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-terminal-surface border border-terminal-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {searchResults.map((stock, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectStock(stock)}
                    className="w-full flex items-center justify-between p-4 hover:bg-terminal-bg transition-colors text-left border-b border-terminal-border/50 last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold text-terminal-text">{stock.symbol}</p>
                      <p className="text-sm text-terminal-muted">{stock.instrument_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-terminal-muted">{stock.exchange}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Investment Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                max={maxDate}
                className="w-full pl-10 pr-4 py-3 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none"
              />
            </div>
            <p className="text-xs text-terminal-muted mt-1">
              Select a date within the last 5 years
            </p>
          </div>

          {/* Historical Price (Auto-fetched, Read-only) */}
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Historical Price (Auto-fetched)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
              <input
                type="text"
                value={
                  isFetchingHistorical
                    ? 'Fetching...'
                    : historicalPrice
                    ? `$${historicalPrice.toFixed(2)}`
                    : historicalError
                    ? 'Error'
                    : 'Select symbol and date'
                }
                readOnly
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none cursor-not-allowed ${
                  historicalPrice
                    ? 'bg-success-green/10 border-success-green text-success-green font-semibold'
                    : historicalError
                    ? 'bg-danger-red/10 border-danger-red text-danger-red'
                    : 'bg-terminal-surface border-terminal-border text-terminal-muted'
                }`}
              />
              {isFetchingHistorical && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-blue animate-spin" />
              )}
            </div>
            {actualDate && actualDate !== date && (
              <p className="text-xs text-warning-yellow mt-1">
                Market was closed on {format(new Date(date), 'MMM dd, yyyy')}. Using {format(new Date(actualDate), 'MMM dd, yyyy')} (closest trading day)
              </p>
            )}
            {historicalError && (
              <p className="text-xs text-danger-red mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {historicalError}
              </p>
            )}
          </div>

          {/* Current Price (Auto-fetched, Read-only) */}
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Current Price (Real-time)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
              <input
                type="text"
                value={
                  isFetchingCurrent
                    ? 'Fetching...'
                    : currentPrice
                    ? `$${currentPrice.toFixed(2)}`
                    : 'Select symbol'
                }
                readOnly
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none cursor-not-allowed ${
                  currentPrice
                    ? 'bg-accent-blue/10 border-accent-blue text-accent-blue font-semibold'
                    : 'bg-terminal-surface border-terminal-border text-terminal-muted'
                }`}
              />
            </div>
          </div>

          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-medium text-terminal-text mb-2">
              Investment Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                min="1"
                max="1000000"
                step="100"
                className="w-full pl-10 pr-4 py-3 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none placeholder:text-terminal-muted"
              />
            </div>
            <p className="text-xs text-terminal-muted mt-1">
              Enter amount between $1 and $1,000,000
            </p>
          </div>

          {/* Auto-calculated Preview */}
          {sharesBought !== null && currentValue !== null && totalProfit !== null && (
            <div className="bg-terminal-bg border border-terminal-border rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-terminal-text mb-2">Quick Preview:</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-terminal-muted">Shares Bought</p>
                  <p className="font-semibold text-terminal-text">{sharesBought.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-terminal-muted">Current Value</p>
                  <p className="font-semibold text-success-green">
                    ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-terminal-muted">Profit/Loss</p>
                  <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                    {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-sm ml-2">
                      ({totalProfit >= 0 ? '+' : ''}{totalProfitPercent?.toFixed(2)}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-danger-red/10 border border-danger-red rounded-lg p-4">
              <p className="text-danger-red text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {purchaseSuccess && (
            <div className="bg-success-green/10 border border-success-green rounded-lg p-4 animate-slide-in">
              <p className="text-success-green text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {purchaseSuccess}
              </p>
              <p className="text-success-green text-xs mt-1">
                Check your Portfolio and Transaction History!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setShowPurchaseConfirm(true)}
              disabled={!canPurchase}
              variant="success"
              className="w-full"
            >
              {isExecutingPurchase ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Execute Purchase
                </>
              )}
            </Button>

            <Button
              onClick={handleViewChart}
              disabled={!canViewChart || isSimulating}
              className="w-full"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  View Chart
                </>
              )}
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Full Simulation Results with Chart */}
      {fullResult && (
        <div className="space-y-6 animate-slide-in">
          {/* "What If?" Summary Card */}
          <div className="bg-gradient-to-br from-accent-blue/10 to-terminal-surface border border-accent-blue/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-accent-blue" />
              <h3 className="text-xl font-bold text-terminal-text">Investment Analysis</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-terminal-muted mb-1">Stock</p>
                <p className="text-2xl font-bold text-terminal-text">{fullResult.symbol}</p>
                <p className="text-sm text-terminal-muted">{fullResult.companyName}</p>
              </div>

              <div>
                <p className="text-sm text-terminal-muted mb-1">Investment Period</p>
                <p className="text-lg font-semibold text-terminal-text">
                  {format(new Date(fullResult.actualDate), 'MMM dd, yyyy')} - Today
                </p>
              </div>
            </div>
          </div>

          {/* Investment Summary */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
              <p className="text-sm text-terminal-muted mb-2">Initial Investment</p>
              <p className="text-2xl font-bold text-terminal-text">
                ${fullResult.investmentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-terminal-muted mt-1">
                @ ${fullResult.historicalPrice.toFixed(2)}/share
              </p>
            </div>

            <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
              <p className="text-sm text-terminal-muted mb-2">Shares Bought</p>
              <p className="text-2xl font-bold text-accent-blue">
                {fullResult.sharesBought.toFixed(4)}
              </p>
            </div>

            <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
              <p className="text-sm text-terminal-muted mb-2">Current Value</p>
              <p className="text-2xl font-bold text-success-green">
                ${fullResult.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-terminal-muted mt-1">
                @ ${fullResult.currentPrice.toFixed(2)}/share
              </p>
            </div>

            <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
              <p className="text-sm text-terminal-muted mb-2">Total Profit/Loss</p>
              <div className={`flex items-center gap-2 ${fullResult.totalProfit >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                {fullResult.totalProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <p className="text-2xl font-bold">
                  {fullResult.totalProfit >= 0 ? '+' : ''}${fullResult.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className={`text-sm font-semibold mt-1 ${fullResult.totalProfit >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                {fullResult.totalProfit >= 0 ? '+' : ''}{fullResult.totalProfitPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Price Chart */}
          {fullResult.chartData.length > 0 && (
            <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-terminal-text mb-4">
                Price Movement: {format(new Date(fullResult.actualDate), 'MMM yyyy')} - Today
              </h3>
              <StockChart data={fullResult.chartData} height={350} />
            </div>
          )}

          {/* Historical Data */}
          <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-terminal-text mb-4">
              Historical Data ({format(new Date(fullResult.actualDate), 'MMM dd, yyyy')})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-terminal-muted mb-1">Open</p>
                <p className="text-lg font-semibold text-terminal-text">
                  ${fullResult.historicalData.open.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-terminal-muted mb-1">High</p>
                <p className="text-lg font-semibold text-success-green">
                  ${fullResult.historicalData.high.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-terminal-muted mb-1">Low</p>
                <p className="text-lg font-semibold text-danger-red">
                  ${fullResult.historicalData.low.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-terminal-muted mb-1">Close</p>
                <p className="text-lg font-semibold text-terminal-text">
                  ${fullResult.historicalData.close.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToWatchlist}
              disabled={isAddingToWatchlist}
              variant="secondary"
              className="flex-1"
            >
              {isAddingToWatchlist ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Add to Watchlist
                </>
              )}
            </Button>

            <Button onClick={handleReset} variant="outline" className="flex-1">
              Simulate Another
            </Button>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      <Modal
        isOpen={showPurchaseConfirm}
        onClose={() => setShowPurchaseConfirm(false)}
        title="Confirm Backdated Purchase"
      >
        <div className="space-y-4">
          <div className="bg-warning-yellow/10 border border-warning-yellow rounded-lg p-4">
            <p className="text-warning-yellow text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Important Notice
            </p>
            <p className="text-terminal-text text-sm">
              This will execute a backdated purchase for simulation purposes. The transaction will be recorded with the historical date ({actualDate ? format(new Date(actualDate), 'MMM dd, yyyy') : date}).
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-terminal-muted">Stock:</span>
              <span className="font-semibold text-terminal-text">{symbol} ({companyName})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">Purchase Date:</span>
              <span className="font-semibold text-terminal-text">
                {actualDate ? format(new Date(actualDate), 'MMM dd, yyyy') : date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">Historical Price:</span>
              <span className="font-semibold text-terminal-text">${historicalPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">Investment Amount:</span>
              <span className="font-semibold text-terminal-text">${parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-terminal-muted">Shares to Buy:</span>
              <span className="font-semibold text-accent-blue">{sharesBought?.toFixed(4)}</span>
            </div>
          </div>

          <div className="border-t border-terminal-border pt-4">
            <p className="text-terminal-text font-semibold mb-2">
              Are you sure you want to execute this purchase?
            </p>
            <p className="text-terminal-muted text-xs">
              ${parseFloat(amount).toLocaleString()} will be deducted from your balance.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExecutePurchase}
              variant="success"
              className="flex-1"
            >
              <ShoppingCart className="w-5 h-5" />
              Confirm Purchase
            </Button>
            <Button
              onClick={() => setShowPurchaseConfirm(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
