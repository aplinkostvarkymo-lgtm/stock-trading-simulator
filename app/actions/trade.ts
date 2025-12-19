'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStockQuote } from '@/lib/stock-api'
import { revalidatePath } from 'next/cache'
import { sanitizeHolding, sanitizeTransaction } from '@/lib/prisma-helpers'

// Validation schemas
const buyStockSchema = z.object({
  symbol: z.string().min(1).max(5).toUpperCase(),
  quantity: z.number().int().min(1).max(10000),
})

const sellStockSchema = z.object({
  symbol: z.string().min(1).max(5).toUpperCase(),
  quantity: z.number().int().min(1),
})

const backdatedPurchaseSchema = z.object({
  symbol: z.string().min(1).max(5).toUpperCase(),
  amount: z.number().min(1).max(1000000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  historicalPrice: z.number().min(0.01),
  companyName: z.string().min(1),
})

interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Buy stock - validates balance, updates holdings, creates transaction
 */
export async function buyStock(symbol: string, quantity: number): Promise<ActionResponse> {
  try {
    // Validate input
    const validated = buyStockSchema.parse({ symbol, quantity })

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    // Fetch current stock price
    const quote = await getStockQuote(validated.symbol)
    if (!quote) {
      return { success: false, error: 'Invalid stock symbol or stock not found.' }
    }

    const totalCost = quote.price * validated.quantity

    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current user data
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Check balance
      if (user.balance.toNumber() < totalCost) {
        throw new Error('Insufficient balance')
      }

      // Deduct from balance
      const newBalance = user.balance.toNumber() - totalCost
      await tx.user.update({
        where: { id: session.user.id },
        data: { balance: newBalance },
      })

      // Update or create holding
      const existingHolding = await tx.holding.findUnique({
        where: {
          userId_symbol: {
            userId: session.user.id,
            symbol: validated.symbol,
          },
        },
      })

      if (existingHolding) {
        // Update existing holding with new average price
        const totalShares = existingHolding.quantity + validated.quantity
        const totalValue =
          existingHolding.averagePrice.toNumber() * existingHolding.quantity +
          quote.price * validated.quantity
        const newAveragePrice = totalValue / totalShares

        await tx.holding.update({
          where: { id: existingHolding.id },
          data: {
            quantity: totalShares,
            averagePrice: newAveragePrice,
          },
        })
      } else {
        // Create new holding
        await tx.holding.create({
          data: {
            userId: session.user.id,
            symbol: validated.symbol,
            companyName: quote.name,
            quantity: validated.quantity,
            averagePrice: quote.price,
          },
        })
      }

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'BUY',
          symbol: validated.symbol,
          companyName: quote.name,
          quantity: validated.quantity,
          price: quote.price,
          total: totalCost,
          balanceAfter: newBalance,
        },
      })

      return { newBalance, quote }
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/portfolio')
    revalidatePath('/dashboard/transactions')

    return {
      success: true,
      data: {
        message: `Successfully bought ${validated.quantity} shares of ${validated.symbol}`,
        balance: result.newBalance,
        stock: result.quote,
      },
    }
  } catch (error) {
    console.error('Buy stock error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to buy stock' }
  }
}

/**
 * Sell stock - checks ownership, updates holdings, creates transaction
 */
export async function sellStock(symbol: string, quantity: number): Promise<ActionResponse> {
  try {
    // Validate input
    const validated = sellStockSchema.parse({ symbol, quantity })

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    // Fetch current stock price
    const quote = await getStockQuote(validated.symbol)
    if (!quote) {
      return { success: false, error: 'Invalid stock symbol or stock not found.' }
    }

    const totalProceeds = quote.price * validated.quantity

    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current holding
      const holding = await tx.holding.findUnique({
        where: {
          userId_symbol: {
            userId: session.user.id,
            symbol: validated.symbol,
          },
        },
      })

      if (!holding) {
        throw new Error('You do not own any shares of this stock')
      }

      if (holding.quantity < validated.quantity) {
        throw new Error(`Insufficient shares. You own ${holding.quantity} shares.`)
      }

      // Get current user data
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Add proceeds to balance
      const newBalance = user.balance.toNumber() + totalProceeds
      await tx.user.update({
        where: { id: session.user.id },
        data: { balance: newBalance },
      })

      // Update or delete holding
      if (holding.quantity === validated.quantity) {
        // Delete holding if selling all shares
        await tx.holding.delete({
          where: { id: holding.id },
        })
      } else {
        // Reduce quantity
        await tx.holding.update({
          where: { id: holding.id },
          data: {
            quantity: holding.quantity - validated.quantity,
          },
        })
      }

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'SELL',
          symbol: validated.symbol,
          companyName: quote.name,
          quantity: validated.quantity,
          price: quote.price,
          total: totalProceeds,
          balanceAfter: newBalance,
        },
      })

      return { newBalance, quote }
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/portfolio')
    revalidatePath('/dashboard/transactions')

    return {
      success: true,
      data: {
        message: `Successfully sold ${validated.quantity} shares of ${validated.symbol}`,
        balance: result.newBalance,
        stock: result.quote,
      },
    }
  } catch (error) {
    console.error('Sell stock error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to sell stock' }
  }
}

/**
 * Get user's current balance
 */
export async function getUserBalance(): Promise<ActionResponse<number>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, data: user.balance.toNumber() }
  } catch (error) {
    console.error('Get balance error:', error)
    return { success: false, error: 'Failed to fetch balance' }
  }
}

/**
 * Get user's holdings
 */
export async function getHoldings(): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const holdings = await prisma.holding.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Sanitize Decimal fields for client components
    const sanitizedHoldings = holdings.map(sanitizeHolding)

    return { success: true, data: sanitizedHoldings }
  } catch (error) {
    console.error('Get holdings error:', error)
    return { success: false, error: 'Failed to fetch holdings' }
  }
}

/**
 * Get user's transaction history
 */
export async function getTransactions(limit?: number): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    // Sanitize Decimal fields for client components
    const sanitizedTransactions = transactions.map(sanitizeTransaction)

    return { success: true, data: sanitizedTransactions }
  } catch (error) {
    console.error('Get transactions error:', error)
    return { success: false, error: 'Failed to fetch transactions' }
  }
}

/**
 * Calculate total portfolio value with current prices
 */
export async function getPortfolioValue(): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const holdings = await prisma.holding.findMany({
      where: { userId: session.user.id },
    })

    if (holdings.length === 0) {
      return {
        success: true,
        data: {
          totalValue: 0,
          totalCost: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
        },
      }
    }

    // Fetch current prices (this is simplified; in production, use batch quotes)
    let totalValue = 0
    let totalCost = 0

    for (const holding of holdings) {
      const cost = holding.averagePrice.toNumber() * holding.quantity
      totalCost += cost

      // In a real implementation, fetch current price here
      // For now, we'll return the holdings data for the UI to calculate
      totalValue += cost // Placeholder
    }

    const totalGainLoss = totalValue - totalCost
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

    // Sanitize Decimal fields for client components
    const sanitizedHoldings = holdings.map(sanitizeHolding)

    return {
      success: true,
      data: {
        holdings: sanitizedHoldings,
        totalValue,
        totalCost,
        totalGainLoss,
        totalGainLossPercent,
      },
    }
  } catch (error) {
    console.error('Get portfolio value error:', error)
    return { success: false, error: 'Failed to calculate portfolio value' }
  }
}

/**
 * Execute a backdated purchase from Time Machine
 * Allows users to "buy" stocks at historical prices for simulation purposes
 */
export async function executeBackdatedPurchase(
  symbol: string,
  amount: number,
  date: string,
  historicalPrice: number,
  companyName: string
): Promise<ActionResponse> {
  try {
    // Validate input
    const validated = backdatedPurchaseSchema.parse({
      symbol,
      amount,
      date,
      historicalPrice,
      companyName,
    })

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    // Validate date is in the past
    const purchaseDate = new Date(validated.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (purchaseDate >= today) {
      return { success: false, error: 'Purchase date must be in the past.' }
    }

    // Calculate shares (minimum 0.0001 shares)
    const sharesBought = validated.amount / validated.historicalPrice
    
    if (sharesBought < 0.0001) {
      return { 
        success: false, 
        error: 'Investment amount too small. Minimum 0.0001 shares required.' 
      }
    }

    const totalCost = validated.amount

    // Execute backdated purchase in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get current user data
      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Check if user has enough balance
      const currentBalance = user.balance.toNumber()
      if (currentBalance < totalCost) {
        throw new Error(
          `Insufficient balance. You have $${currentBalance.toFixed(2)}, but need $${totalCost.toFixed(2)}`
        )
      }

      // Deduct from balance
      const newBalance = currentBalance - totalCost
      await tx.user.update({
        where: { id: session.user.id },
        data: { balance: newBalance },
      })

      // Update or create holding
      const existingHolding = await tx.holding.findUnique({
        where: {
          userId_symbol: {
            userId: session.user.id,
            symbol: validated.symbol,
          },
        },
      })

      if (existingHolding) {
        // Update existing holding with new average price
        const totalShares = existingHolding.quantity + sharesBought
        const totalValue =
          existingHolding.averagePrice.toNumber() * existingHolding.quantity +
          validated.historicalPrice * sharesBought
        const newAveragePrice = totalValue / totalShares

        await tx.holding.update({
          where: { id: existingHolding.id },
          data: {
            quantity: totalShares,
            averagePrice: newAveragePrice,
          },
        })
      } else {
        // Create new holding
        await tx.holding.create({
          data: {
            userId: session.user.id,
            symbol: validated.symbol,
            companyName: validated.companyName,
            quantity: sharesBought,
            averagePrice: validated.historicalPrice,
          },
        })
      }

      // Create transaction record with BACKDATED timestamp
      // Use the historical date, not the current date
      const backdatedTimestamp = new Date(validated.date)
      backdatedTimestamp.setHours(16, 0, 0, 0) // Set to 4 PM (market close)

      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'BUY',
          symbol: validated.symbol,
          companyName: validated.companyName,
          quantity: sharesBought,
          price: validated.historicalPrice,
          total: totalCost,
          balanceAfter: newBalance,
          timestamp: backdatedTimestamp, // BACKDATED timestamp
        },
      })

      return { 
        newBalance, 
        sharesBought,
        symbol: validated.symbol,
        companyName: validated.companyName,
        historicalPrice: validated.historicalPrice,
        purchaseDate: validated.date,
      }
    })

    // Revalidate all relevant paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/portfolio')
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard/time-machine')

    return {
      success: true,
      data: {
        message: `Successfully purchased ${result.sharesBought.toFixed(4)} shares of ${result.symbol} at $${result.historicalPrice.toFixed(2)} on ${result.purchaseDate}`,
        balance: result.newBalance,
        shares: result.sharesBought,
        symbol: result.symbol,
        companyName: result.companyName,
      },
    }
  } catch (error) {
    console.error('Backdated purchase error:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    return { success: false, error: 'Failed to execute backdated purchase' }
  }
}

