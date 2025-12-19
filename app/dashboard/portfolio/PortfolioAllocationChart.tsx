'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface Holding {
  symbol: string
  companyName: string
  totalValue: number
}

interface Props {
  holdings: Holding[]
}

// Trading terminal color palette for the pie chart
const COLORS = [
  '#3b82f6', // accent-blue
  '#10b981', // success-green
  '#f59e0b', // warning-yellow
  '#ef4444', // danger-red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
]

export default function PortfolioAllocationChart({ holdings }: Props) {
  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0)

  // Prepare data for pie chart
  const chartData = holdings.map((holding) => ({
    name: holding.symbol,
    value: holding.totalValue,
    percentage: ((holding.totalValue / totalValue) * 100).toFixed(2),
    companyName: holding.companyName,
  }))

  // Sort by value descending
  chartData.sort((a, b) => b.value - a.value)

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    // Only show label if percentage is > 5%
    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-terminal-surface border border-terminal-border rounded-lg p-3">
                      <p className="font-bold text-terminal-text mb-1">{data.name}</p>
                      <p className="text-xs text-terminal-muted mb-2">{data.companyName}</p>
                      <p className="text-sm text-terminal-text">
                        ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-accent-blue font-semibold">
                        {data.percentage}% of portfolio
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-terminal-muted mb-3">Allocation Breakdown</h3>
        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 bg-terminal-bg rounded-lg hover:bg-terminal-border/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="font-semibold text-terminal-text">{item.name}</p>
                  <p className="text-xs text-terminal-muted truncate max-w-[150px]">
                    {item.companyName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-terminal-text">
                  ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-accent-blue font-semibold">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

