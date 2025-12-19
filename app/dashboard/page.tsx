import Link from 'next/link'
import { getHoldings, getTransactions, getUserBalance } from '@/app/actions/trade'
import { getBatchQuotes } from '@/lib/stock-api'
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react'
import { format } from 'date-fns'

// Force fresh data on every page load to get latest stock prices
export const revalidate = 0

export default async function DashboardPage() {
  const [balanceResult, holdingsResult, transactionsResult] = await Promise.all([
    getUserBalance(),
    getHoldings(),
    getTransactions(10),
  ])

  const balance: number = balanceResult.success && balanceResult.data !== undefined ? balanceResult.data : 0
  const holdings = holdingsResult.success ? holdingsResult.data : []
  const transactions = transactionsResult.success ? transactionsResult.data : []

  // Get current prices for holdings
  let portfolioValue = 0
  let totalCost = 0
  let holdingsWithPrices: any[] = []

  // Fetch API error state
  let apiError: string | null = null

  if (holdings.length > 0) {
    const symbols = holdings.map((h: any) => h.symbol)
    
    try {
      const result = await getBatchQuotes(symbols)
      
      // Validate result structure to prevent undefined errors
      if (!result || typeof result !== 'object') {
        console.error('[Dashboard] CRITICAL: getBatchQuotes returned invalid data:', result)
        apiError = 'Internal error: Invalid API response structure'
      } else {
        const quotes = result.quotes || new Map()
        apiError = result.error || null

        if (apiError) {
          console.error('[Dashboard] API Error:', apiError)
        }

        holdingsWithPrices = holdings.map((holding: any) => {
          const quote = quotes.get(holding.symbol)
          
          // CRITICAL: Never fall back to averagePrice for current price
          // Calculate gain/loss using REAL-TIME price from TwelveData API
          const currentPrice = quote?.price || 0
          const hasValidQuote = quote && quote.price > 0
          
          const totalValue = hasValidQuote ? currentPrice * holding.quantity : 0
          const cost = holding.averagePrice * holding.quantity
          const gainLoss = hasValidQuote ? totalValue - cost : 0
          const gainLossPercent = hasValidQuote && cost > 0 ? (gainLoss / cost) * 100 : 0

          // Only add to portfolio value if we have valid quote
          if (hasValidQuote) {
            portfolioValue += totalValue
          }
          totalCost += cost

          return {
            ...holding,
            currentPrice: hasValidQuote ? currentPrice : null,
            totalValue,
            gainLoss,
            gainLossPercent,
            hasValidQuote,
          }
        })
      }
    } catch (error) {
      // CRITICAL: Never let API errors crash the dashboard
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Dashboard] CRITICAL ERROR fetching quotes:', errorMsg)
      console.error('[Dashboard] Full error:', error)
      apiError = `Failed to fetch prices: ${errorMsg}`
      
      // Fallback: Show holdings with database prices only
      holdingsWithPrices = holdings.map((holding: any) => {
        const cost = holding.averagePrice * holding.quantity
        totalCost += cost
        
        return {
          ...holding,
          currentPrice: null,
          totalValue: 0,
          gainLoss: 0,
          gainLossPercent: 0,
          hasValidQuote: false,
        }
      })
      
      console.log('[Dashboard] Fallback: Showing', holdings.length, 'holdings with database prices only')
    }
  }

  const totalGainLoss = portfolioValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
  const totalAssets = balance + portfolioValue
  
  // Check if we have incomplete price data
  const hasIncompleteData = holdingsWithPrices.length > 0 && holdingsWithPrices.some(h => !h.hasValidQuote)
  const allPricesLoaded = holdingsWithPrices.length > 0 && holdingsWithPrices.every(h => h.hasValidQuote)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-terminal-text mb-2">Dashboard</h1>
        <p className="text-terminal-muted">Welcome back! Here's your portfolio overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Assets"
          value={`$${(totalAssets || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={hasIncompleteData ? "Some prices unavailable" : undefined}
          icon={<DollarSign className="w-6 h-6 text-accent-blue" />}
          iconBg="bg-accent-blue/10"
        />
        <SummaryCard
          title={hasIncompleteData ? "Portfolio Value *" : "Portfolio Value"}
          value={`$${(portfolioValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={hasIncompleteData ? "Partial data" : undefined}
          icon={<TrendingUp className="w-6 h-6 text-success-green" />}
          iconBg="bg-success-green/10"
        />
        <SummaryCard
          title="Total Gain/Loss"
          value={allPricesLoaded ? `$${(totalGainLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
          subtitle={allPricesLoaded ? `${totalGainLossPercent >= 0 ? '+' : ''}${(totalGainLossPercent || 0).toFixed(2)}%` : "Calculating..."}
          icon={totalGainLoss >= 0 ? <TrendingUp className="w-6 h-6 text-success-green" /> : <TrendingDown className="w-6 h-6 text-danger-red" />}
          iconBg={totalGainLoss >= 0 ? "bg-success-green/10" : "bg-danger-red/10"}
          valueColor={allPricesLoaded ? (totalGainLoss >= 0 ? "text-success-green" : "text-danger-red") : "text-terminal-muted"}
        />
        <SummaryCard
          title="Holdings"
          value={(holdings.length || 0).toString()}
          subtitle="Active Positions"
          icon={<Package className="w-6 h-6 text-warning-yellow" />}
          iconBg="bg-warning-yellow/10"
        />
      </div>

      {/* Top Holdings */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-terminal-text">Top Holdings</h2>
          <Link href="/dashboard/portfolio" className="text-accent-blue hover:underline text-sm font-medium">
            View All →
          </Link>
        </div>

        {/* API Error/Status Display */}
        {apiError && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-danger-red/10 border border-danger-red rounded-lg">
            <div className="flex-shrink-0 text-danger-red">
              ⚠️
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-danger-red">
                {apiError}
              </p>
              <p className="text-xs text-danger-red/70 mt-1">
                Unable to fetch live prices from TwelveData. Showing historical purchase prices only.
              </p>
            </div>
          </div>
        )}
        
        {/* Partial Data Warning (only if no error but missing data) */}
        {!apiError && holdingsWithPrices.length > 0 && holdingsWithPrices.some(h => !h.hasValidQuote) && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-warning-yellow/10 border border-warning-yellow/30 rounded-lg">
            <div className="w-2 h-2 bg-warning-yellow rounded-full"></div>
            <p className="text-sm text-warning-yellow">
              Some prices unavailable. Showing {holdingsWithPrices.filter(h => h.hasValidQuote).length} of {holdingsWithPrices.length} holdings.
            </p>
          </div>
        )}

        {holdingsWithPrices.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-terminal-muted mx-auto mb-3" />
            <p className="text-terminal-muted mb-4">No holdings yet</p>
            <Link
              href="/dashboard/trade"
              className="inline-block px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Start Trading
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-terminal-muted text-sm border-b border-terminal-border">
                  <th className="pb-3 font-semibold">Symbol</th>
                  <th className="pb-3 font-semibold">Quantity</th>
                  <th className="pb-3 font-semibold">Avg Price</th>
                  <th className="pb-3 font-semibold">Current Price</th>
                  <th className="pb-3 font-semibold">Total Value</th>
                  <th className="pb-3 font-semibold text-right">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {holdingsWithPrices.slice(0, 5).map((holding: any) => (
                  <tr key={holding.id} className="border-b border-terminal-border/50 hover:bg-terminal-bg/50">
                    <td className="py-4">
                      <div>
                        <p className="font-semibold text-terminal-text">{holding.symbol}</p>
                        <p className="text-xs text-terminal-muted">{holding.companyName}</p>
                      </div>
                    </td>
                    <td className="py-4 text-terminal-text">{holding.quantity?.toFixed(4) ?? '—'}</td>
                    <td className="py-4 text-terminal-text">${holding.averagePrice?.toFixed(2) ?? '—'}</td>
                    <td className="py-4 text-terminal-text">
                      {holding.hasValidQuote ? (
                        `$${holding.currentPrice.toFixed(2)}`
                      ) : (
                        <span className="text-danger-red text-sm">—</span>
                      )}
                    </td>
                    <td className="py-4 text-terminal-text">
                      {holding.hasValidQuote ? (
                        `$${holding.totalValue.toFixed(2)}`
                      ) : (
                        <span className="text-terminal-muted">—</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {holding.hasValidQuote ? (
                        <div className={holding.gainLoss >= 0 ? 'text-success-green' : 'text-danger-red'}>
                          <p className="font-semibold">
                            {holding.gainLoss >= 0 && '+'}{holding.gainLoss.toFixed(2)}
                          </p>
                          <p className="text-xs">
                            {holding.gainLossPercent >= 0 && '+'}{holding.gainLossPercent.toFixed(2)}%
                          </p>
                        </div>
                      ) : (
                        <div className="text-terminal-muted">
                          <p className="text-sm">N/A</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-terminal-text">Recent Transactions</h2>
          <Link href="/dashboard/transactions" className="text-accent-blue hover:underline text-sm font-medium">
            View All →
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-terminal-muted">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-terminal-bg rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded text-xs font-semibold ${
                    tx.type === 'BUY' ? 'bg-success-green/10 text-success-green' : 'bg-danger-red/10 text-danger-red'
                  }`}>
                    {tx.type}
                  </div>
                  <div>
                    <p className="font-semibold text-terminal-text">{tx.symbol}</p>
                    <p className="text-xs text-terminal-muted">
                      {tx.quantity} shares @ ${tx.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-terminal-text">
                    ${tx.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-terminal-muted">
                    {format(new Date(tx.timestamp), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  valueColor = 'text-terminal-text',
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  iconBg: string
  valueColor?: string
}) {
  return (
    <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-terminal-muted font-medium">{title}</p>
        <div className={`${iconBg} p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor} mb-1`}>{value}</p>
      {subtitle && <p className="text-sm text-terminal-muted">{subtitle}</p>}
    </div>
  )
}

