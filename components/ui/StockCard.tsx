import { TrendingUp, TrendingDown } from 'lucide-react'

interface StockCardProps {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  onClick?: () => void
  className?: string
}

export default function StockCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  onClick,
  className = '',
}: StockCardProps) {
  const isPositive = change >= 0
  const textColor = isPositive ? 'text-success-green' : 'text-danger-red'
  const borderColor = isPositive ? 'border-success-green/20' : 'border-danger-red/20'
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <div
      className={`bg-terminal-surface border ${borderColor} rounded-lg p-4 hover:border-accent-blue transition-all cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-terminal-text">{symbol}</h3>
          <p className="text-sm text-terminal-muted truncate">{name}</p>
        </div>
        <Icon className={`w-5 h-5 ${textColor}`} />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-terminal-text">
            ${price.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${textColor}`}>
            {isPositive && '+'}{change.toFixed(2)}
          </p>
          <p className={`text-xs ${textColor}`}>
            {isPositive && '+'}{changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  )
}

