/**
 * Currency formatting utilities for consistent display across the app
 */

/**
 * Format a number as USD currency
 * Example: 1234.56 → "$1,234.56"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00'
  }
  
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format a number as a price (without dollar sign)
 * Example: 1234.56 → "1,234.56"
 */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00'
  }
  
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format a percentage
 * Example: 12.3456 → "+12.35%"
 */
export function formatPercent(value: number | null | undefined, showSign = true): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%'
  }
  
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  if (showSign && value > 0) {
    return `+${formatted}%`
  }
  
  return `${formatted}%`
}

/**
 * Format a large number with abbreviations
 * Example: 1500000 → "1.5M"
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  }
  
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  
  return value.toLocaleString('en-US')
}

