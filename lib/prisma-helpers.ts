import { Decimal } from '@prisma/client/runtime/library'

/**
 * Converts Prisma Decimal fields to numbers for JSON serialization
 * This is necessary when passing data from Server Components to Client Components
 */
export function sanitizeDecimal(value: Decimal | number): number {
  if (value instanceof Decimal) {
    return value.toNumber()
  }
  return value
}

/**
 * Recursively sanitizes an object, converting all Decimal fields to numbers
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Decimal) {
    return obj.toNumber() as unknown as T
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }

  return obj
}

/**
 * Type-safe sanitization for holdings
 */
export function sanitizeHolding(holding: any) {
  return {
    ...holding,
    averagePrice: sanitizeDecimal(holding.averagePrice),
  }
}

/**
 * Type-safe sanitization for transactions
 */
export function sanitizeTransaction(transaction: any) {
  return {
    ...transaction,
    price: sanitizeDecimal(transaction.price),
    total: sanitizeDecimal(transaction.total),
    balanceAfter: sanitizeDecimal(transaction.balanceAfter),
  }
}

/**
 * Type-safe sanitization for user balance
 */
export function sanitizeBalance(balance: Decimal | number): number {
  return sanitizeDecimal(balance)
}

