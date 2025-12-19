'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'

interface FilterState {
  type: 'ALL' | 'BUY' | 'SELL'
  symbol: string
  dateFrom: string
  dateTo: string
}

interface Props {
  onFilterChange: (filters: FilterState) => void
}

export default function TransactionFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    type: 'ALL',
    symbol: '',
    dateFrom: '',
    dateTo: '',
  })

  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      type: 'ALL' as const,
      symbol: '',
      dateFrom: '',
      dateTo: '',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters =
    filters.type !== 'ALL' ||
    filters.symbol !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== ''

  return (
    <div className="bg-terminal-surface border border-terminal-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-accent-blue" />
          <h3 className="font-semibold text-terminal-text">Filters</h3>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-accent-blue hover:underline"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {showFilters && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-terminal-text mb-2">
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none"
              >
                <option value="ALL">All Transactions</option>
                <option value="BUY">Buy Only</option>
                <option value="SELL">Sell Only</option>
              </select>
            </div>

            {/* Symbol Search */}
            <div>
              <label className="block text-sm font-medium text-terminal-text mb-2">
                Stock Symbol
              </label>
              <input
                type="text"
                placeholder="e.g., AAPL"
                value={filters.symbol}
                onChange={(e) => handleFilterChange('symbol', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none placeholder:text-terminal-muted"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-terminal-text mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-terminal-text mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none"
              />
            </div>
          </div>

          {/* Active Filters & Reset */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-terminal-border">
              <div className="flex items-center gap-2 text-sm text-terminal-muted">
                <span>Active filters:</span>
                {filters.type !== 'ALL' && (
                  <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue rounded">
                    {filters.type}
                  </span>
                )}
                {filters.symbol && (
                  <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue rounded">
                    {filters.symbol}
                  </span>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue rounded">
                    Date Range
                  </span>
                )}
              </div>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-1 text-sm text-danger-red hover:bg-danger-red/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

