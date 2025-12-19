'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TransactionFilters from './TransactionFilters'

interface Transaction {
  id: string
  timestamp: string
  type: 'BUY' | 'SELL'
  symbol: string
  companyName: string
  quantity: number
  price: string
  total: string
  balanceAfter: string
}

interface Props {
  transactions: Transaction[]
}

interface FilterState {
  type: 'ALL' | 'BUY' | 'SELL'
  symbol: string
  dateFrom: string
  dateTo: string
}

const ITEMS_PER_PAGE = 20

export default function TransactionTable({ transactions }: Props) {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    type: 'ALL',
    symbol: '',
    dateFrom: '',
    dateTo: '',
  })

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filters.type !== 'ALL' && tx.type !== filters.type) {
        return false
      }

      // Symbol filter
      if (filters.symbol && !tx.symbol.includes(filters.symbol)) {
        return false
      }

      // Date range filter
      const txDate = new Date(tx.timestamp)
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        if (txDate < fromDate) return false
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999) // Include end of day
        if (txDate > toDate) return false
      }

      return true
    })
  }, [transactions, filters])

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <TransactionFilters onFilterChange={handleFilterChange} />

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-terminal-muted">
        <p>
          Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of{' '}
          {filteredTransactions.length} transactions
        </p>
        {filteredTransactions.length < transactions.length && (
          <p className="text-accent-blue">
            Filtered from {transactions.length} total
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-terminal-muted text-sm border-b border-terminal-border">
              <th className="pb-3 font-semibold">Date & Time</th>
              <th className="pb-3 font-semibold">Type</th>
              <th className="pb-3 font-semibold">Symbol</th>
              <th className="pb-3 font-semibold">Company</th>
              <th className="pb-3 font-semibold text-right">Quantity</th>
              <th className="pb-3 font-semibold text-right">Price</th>
              <th className="pb-3 font-semibold text-right">Total</th>
              <th className="pb-3 font-semibold text-right">Balance After</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((tx) => (
              <tr key={tx.id} className="border-b border-terminal-border/50 hover:bg-terminal-bg/50">
                <td className="py-4 text-terminal-text">
                  <div>
                    <p className="font-medium">{format(new Date(tx.timestamp), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-terminal-muted">
                      {format(new Date(tx.timestamp), 'hh:mm a')}
                    </p>
                  </div>
                </td>
                <td className="py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      tx.type === 'BUY'
                        ? 'bg-success-green/10 text-success-green'
                        : 'bg-danger-red/10 text-danger-red'
                    }`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td className="py-4 text-terminal-text font-bold">{tx.symbol}</td>
                <td className="py-4 text-terminal-muted text-sm">{tx.companyName}</td>
                <td className="py-4 text-right text-terminal-text font-semibold">{tx.quantity}</td>
                <td className="py-4 text-right text-terminal-text">
                  ${parseFloat(tx.price).toFixed(2)}
                </td>
                <td className="py-4 text-right">
                  <span
                    className={`font-bold ${
                      tx.type === 'BUY' ? 'text-danger-red' : 'text-success-green'
                    }`}
                  >
                    {tx.type === 'BUY' ? '-' : '+'}${parseFloat(tx.total).toFixed(2)}
                  </span>
                </td>
                <td className="py-4 text-right text-terminal-muted">
                  $
                  {parseFloat(tx.balanceAfter).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 bg-terminal-surface border border-terminal-border rounded-lg text-terminal-text hover:bg-terminal-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-accent-blue text-white'
                        : 'bg-terminal-surface text-terminal-text hover:bg-terminal-border'
                    }`}
                  >
                    {page}
                  </button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="text-terminal-muted">
                    ...
                  </span>
                )
              }
              return null
            })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 bg-terminal-surface border border-terminal-border rounded-lg text-terminal-text hover:bg-terminal-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

