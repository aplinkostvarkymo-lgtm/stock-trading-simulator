import { getHoldings } from '@/app/actions/trade'
import { getBatchQuotes } from '@/lib/stock-api'
import { TrendingUp, TrendingDown, Package, PieChart as PieChartIcon } from 'lucide-react'
import Link from 'next/link'
import PortfolioAllocationChart from './PortfolioAllocationChart'

// Force fresh data on every page load to get latest stock prices
export const revalidate = 0

export default async function PortfolioPage() {
  const holdingsResult = await getHoldings()
  const holdings = holdingsResult.success ? holdingsResult.data : []

  let portfolioValue = 0
  let totalCost = 0
  let holdingsWithPrices: any[] = []
  let apiError: string | null = null

  if (holdings.length > 0) {
    const symbols = holdings.map((h: any) => h.symbol)
    
    try {
      const result = await getBatchQuotes(symbols)
      
      // Validate result structure
      if (!result || typeof result !== 'object') {
        console.error('[Portfolio] CRITICAL: getBatchQuotes returned invalid data:', result)
        apiError = 'Internal error: Invalid API response structure'
      } else {
        const quotes = result.quotes || new Map()
        apiError = result.error || null

        if (apiError) {
          console.error('[Portfolio] API Error:', apiError)
        }

        holdingsWithPrices = holdings.map((holding: any) => {
          const quote = quotes.get(holding.symbol)
          
          // CRITICAL: Never fall back to averagePrice for current price
          // If quote fails, we need to show an error state, not 0% gain
          const currentPrice = quote?.price || 0
          const hasValidQuote = quote && quote.price > 0
          
          // Calculate using REAL-TIME price, not historical price
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
            currentPrice: hasValidQuote ? currentPrice : null, // null indicates missing price
            totalValue,
            cost,
            gainLoss,
            gainLossPercent,
            change: quote?.change || 0,
            changePercent: quote?.changePercent || 0,
            hasValidQuote, // Flag to show loading/error state in UI
          }
        })

        // Sort by total value descending
        holdingsWithPrices.sort((a, b) => b.totalValue - a.totalValue)
      }
    } catch (error) {
      // CRITICAL: Never let API errors crash the portfolio page
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Portfolio] CRITICAL ERROR fetching quotes:', errorMsg)
      console.error('[Portfolio] Full error:', error)
      apiError = `Failed to fetch prices: ${errorMsg}`
      
      // Fallback: Show holdings with database prices only
      holdingsWithPrices = holdings.map((holding: any) => {
        const cost = holding.averagePrice * holding.quantity
        totalCost += cost
        
        return {
          ...holding,
          currentPrice: null,
          totalValue: 0,
          cost,
          gainLoss: 0,
          gainLossPercent: 0,
          change: 0,
          changePercent: 0,
          hasValidQuote: false,
        }
      })
      
      // Sort by cost descending since we don't have current values
      holdingsWithPrices.sort((a, b) => b.cost - a.cost)
    }
  }

  const totalGainLoss = portfolioValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
  
  // Check if we have incomplete data (some prices still loading)
  const hasIncompleteData = holdingsWithPrices.length > 0 && holdingsWithPrices.some(h => !h.hasValidQuote)
  const allPricesLoaded = holdingsWithPrices.length > 0 && holdingsWithPrices.every(h => h.hasValidQuote)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-terminal-text mb-2">Portfolio</h1>
        <p className="text-terminal-muted">Track your holdings and performance</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
          <p className="text-sm text-terminal-muted mb-2">
            Total Value
            {hasIncompleteData && <span className="text-warning-yellow ml-1">*</span>}
          </p>
          <p className="text-3xl font-bold text-accent-blue">
            ${(portfolioValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {hasIncompleteData && (
            <p className="text-xs text-warning-yellow mt-1">* Partial data</p>
          )}
        </div>
        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
          <p className="text-sm text-terminal-muted mb-2">Total Cost</p>
          <p className="text-3xl font-bold text-terminal-text">
            ${(totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
          <p className="text-sm text-terminal-muted mb-2">
            Total Gain/Loss
            {hasIncompleteData && <span className="text-warning-yellow ml-1">*</span>}
          </p>
          {allPricesLoaded ? (
            <>
              <p className={`text-3xl font-bold ${totalGainLoss >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                {totalGainLoss >= 0 && '+'}{(totalGainLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${totalGainLoss >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                {totalGainLossPercent >= 0 && '+'}{(totalGainLossPercent || 0).toFixed(2)}%
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-terminal-muted">—</p>
              <p className="text-xs text-warning-yellow mt-1">Calculating...</p>
            </>
          )}
        </div>
      </div>

      {/* Portfolio Allocation Chart */}
      {holdingsWithPrices.length > 0 && (
        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-accent-blue" />
            <h2 className="text-xl font-bold text-terminal-text">Portfolio Allocation</h2>
          </div>
          <PortfolioAllocationChart holdings={holdingsWithPrices} />
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-terminal-text mb-6">All Holdings</h2>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-danger-red/10 border border-danger-red rounded-lg">
            <div className="flex-shrink-0 text-danger-red text-xl">
              ⚠️
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-danger-red">
                TwelveData API Error
              </p>
              <p className="text-sm text-danger-red mt-1">
                {apiError}
              </p>
              <p className="text-xs text-danger-red/70 mt-2">
                Showing historical purchase prices from database only. Live prices and gain/loss unavailable.
              </p>
            </div>
          </div>
        )}
        
        {/* Partial Data Warning */}
        {!apiError && holdingsWithPrices.length > 0 && holdingsWithPrices.some(h => !h.hasValidQuote) && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-warning-yellow/10 border border-warning-yellow/30 rounded-lg">
            <div className="w-2 h-2 bg-warning-yellow rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-warning-yellow">
                Partial Data: {holdingsWithPrices.filter(h => h.hasValidQuote).length} of {holdingsWithPrices.length} prices loaded
              </p>
              <p className="text-xs text-warning-yellow/70 mt-1">
                Some symbols may be unavailable or invalid.
              </p>
            </div>
          </div>
        )}

        {holdingsWithPrices.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-terminal-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-terminal-text mb-2">No Holdings Yet</h3>
            <p className="text-terminal-muted mb-6">Start building your portfolio by trading stocks</p>
            <Link
              href="/dashboard/trade"
              className="inline-block px-6 py-3 bg-accent-blue hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
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
                  <th className="pb-3 font-semibold text-right">Quantity</th>
                  <th className="pb-3 font-semibold text-right">Avg Price</th>
                  <th className="pb-3 font-semibold text-right">Current Price</th>
                  <th className="pb-3 font-semibold text-right">Day Change</th>
                  <th className="pb-3 font-semibold text-right">Total Value</th>
                  <th className="pb-3 font-semibold text-right">Total Cost</th>
                  <th className="pb-3 font-semibold text-right">Gain/Loss</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdingsWithPrices.map((holding: any) => (
                  <tr key={holding.id} className="border-b border-terminal-border/50 hover:bg-terminal-bg/50">
                    <td className="py-4">
                      <div>
                        <p className="font-bold text-terminal-text">{holding.symbol}</p>
                        <p className="text-xs text-terminal-muted">{holding.companyName}</p>
                      </div>
                    </td>
                    <td className="py-4 text-right text-terminal-text font-semibold">
                      {holding.quantity?.toFixed(4) ?? '—'}
                    </td>
                    <td className="py-4 text-right text-terminal-text">
                      ${holding.averagePrice?.toFixed(2) ?? '—'}
                    </td>
                    <td className="py-4 text-right">
                      {holding.hasValidQuote ? (
                        <p className="font-semibold text-terminal-text">${holding.currentPrice?.toFixed(2) ?? '—'}</p>
                      ) : (
                        <span className="text-danger-red text-sm font-semibold">—</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {holding.hasValidQuote ? (
                        <div className={`flex items-center justify-end gap-1 ${holding.changePercent >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                          {holding.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="text-sm font-semibold">
                            {holding.changePercent >= 0 && '+'}{holding.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-terminal-muted">--</p>
                      )}
                    </td>
                    <td className="py-4 text-right text-terminal-text font-semibold">
                      {holding.hasValidQuote ? (
                        `$${holding.totalValue?.toFixed(2) ?? '—'}`
                      ) : (
                        <span className="text-sm text-terminal-muted">—</span>
                      )}
                    </td>
                    <td className="py-4 text-right text-terminal-muted">
                      ${holding.cost?.toFixed(2) ?? '—'}
                    </td>
                    <td className="py-4 text-right">
                      {holding.hasValidQuote ? (
                        <div className={holding.gainLoss >= 0 ? 'text-success-green' : 'text-danger-red'}>
                          <p className="font-bold">
                            {holding.gainLoss >= 0 && '+'}{holding.gainLoss?.toFixed(2) ?? '—'}
                          </p>
                          <p className="text-sm">
                            {holding.gainLossPercent >= 0 && '+'}{holding.gainLossPercent?.toFixed(2) ?? '—'}%
                          </p>
                        </div>
                      ) : (
                        <div className="text-terminal-muted">
                          <p className="text-sm">N/A</p>
                          <p className="text-xs">Waiting for price</p>
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href="/dashboard/trade"
                        className="text-accent-blue hover:underline text-sm font-medium"
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-terminal-border font-bold">
                  <td className="py-4 text-terminal-text">TOTAL</td>
                  <td className="py-4 text-right text-terminal-text">
                    {holdingsWithPrices.reduce((sum, h) => sum + h.quantity, 0)}
                  </td>
                  <td className="py-4"></td>
                  <td className="py-4"></td>
                  <td className="py-4"></td>
                  <td className="py-4 text-right text-accent-blue">
                    ${portfolioValue.toFixed(2)}
                  </td>
                  <td className="py-4 text-right text-terminal-muted">
                    ${totalCost.toFixed(2)}
                  </td>
                  <td className="py-4 text-right">
                    <div className={totalGainLoss >= 0 ? 'text-success-green' : 'text-danger-red'}>
                      <p>{totalGainLoss >= 0 && '+'}{totalGainLoss.toFixed(2)}</p>
                      <p className="text-sm">{totalGainLossPercent >= 0 && '+'}{totalGainLossPercent.toFixed(2)}%</p>
                    </div>
                  </td>
                  <td className="py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

