'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PriceDisplayProps {
  price: number
  change?: number
  changePercent?: number
  size?: 'sm' | 'md' | 'lg'
  showChange?: boolean
  previousPrice?: number
}

export default function PriceDisplay({
  price,
  change = 0,
  changePercent = 0,
  size = 'md',
  showChange = true,
  previousPrice,
}: PriceDisplayProps) {
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (previousPrice !== undefined && previousPrice !== price) {
      const isUp = price > previousPrice
      setAnimationClass(isUp ? 'price-up' : 'price-down')
      
      const timer = setTimeout(() => {
        setAnimationClass('')
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [price, previousPrice])

  const isPositive = change >= 0
  const textColor = isPositive ? 'text-success-green' : 'text-danger-red'
  const bgColor = isPositive ? 'bg-success-green/10' : 'bg-danger-red/10'
  const Icon = isPositive ? TrendingUp : TrendingDown

  const sizeStyles = {
    sm: {
      price: 'text-lg',
      change: 'text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      price: 'text-2xl',
      change: 'text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      price: 'text-4xl',
      change: 'text-base',
      icon: 'w-5 h-5',
    },
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`${sizeStyles[size].price} font-bold text-terminal-text ${animationClass}`}>
        ${price.toFixed(2)}
      </span>
      
      {showChange && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded ${bgColor}`}>
          <Icon className={`${sizeStyles[size].icon} ${textColor}`} />
          <span className={`${sizeStyles[size].change} font-semibold ${textColor}`}>
            {isPositive && '+'}{change.toFixed(2)} ({isPositive && '+'}{changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  )
}

