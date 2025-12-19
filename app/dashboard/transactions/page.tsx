import { getTransactions } from '@/app/actions/trade'
import { History, TrendingUp, TrendingDown } from 'lucide-react'
import TransactionTable from './TransactionTable'

export default async function TransactionsPage() {
  const transactionsResult = await getTransactions()
  const transactions = transactionsResult.success ? transactionsResult.data : []

  const totalBought = transactions
    .filter((tx: any) => tx.type === 'BUY')
    .reduce((sum: number, tx: any) => sum + parseFloat(tx.total), 0)

  const totalSold = transactions
    .filter((tx: any) => tx.type === 'SELL')
    .reduce((sum: number, tx: any) => sum + parseFloat(tx.total), 0)

  const netInvestment = totalBought - totalSold

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-terminal-text mb-2">Transaction History</h1>
        <p className="text-terminal-muted">Complete record of all your trades</p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-accent-blue/10 p-2 rounded-lg">
              <History className="w-5 h-5 text-accent-blue" />
            </div>
            <p className="text-sm text-terminal-muted font-medium">Total Transactions</p>
          </div>
          <p className="text-2xl font-bold text-terminal-text">{transactions.length}</p>
        </div>

        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-success-green/10 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-success-green" />
            </div>
            <p className="text-sm text-terminal-muted font-medium">Total Bought</p>
          </div>
          <p className="text-2xl font-bold text-success-green">
            ${totalBought.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-danger-red/10 p-2 rounded-lg">
              <TrendingDown className="w-5 h-5 text-danger-red" />
            </div>
            <p className="text-sm text-terminal-muted font-medium">Total Sold</p>
          </div>
          <p className="text-2xl font-bold text-danger-red">
            ${totalSold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
          <p className="text-sm text-terminal-muted mb-2 font-medium">Net Investment</p>
          <p className={`text-2xl font-bold ${netInvestment >= 0 ? 'text-accent-blue' : 'text-warning-yellow'}`}>
            ${netInvestment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-terminal-surface border border-terminal-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-terminal-text mb-6">All Transactions</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-terminal-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-terminal-text mb-2">No Transactions Yet</h3>
            <p className="text-terminal-muted">Your transaction history will appear here</p>
          </div>
        ) : (
          <TransactionTable transactions={transactions} />
        )}
      </div>
    </div>
  )
}

