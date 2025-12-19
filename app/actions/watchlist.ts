'use server'

import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getStockQuote, getBatchQuotes } from '@/lib/stock-api'
import { revalidatePath } from 'next/cache'

interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

const addWatchlistSchema = z.object({
  symbol: z.string().min(1).max(5).toUpperCase(),
  companyName: z.string().min(1),
})

/**
 * Add stock to watchlist
 */
export async function addToWatchlist(
  symbol: string,
  companyName: string
): Promise<ActionResponse> {
  try {
    // Validate input
    const validated = addWatchlistSchema.parse({ symbol, companyName })

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    // Verify stock exists
    const quote = await getStockQuote(validated.symbol)
    if (!quote) {
      return { success: false, error: 'Invalid stock symbol.' }
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: session.user.id,
        symbol: validated.symbol,
        companyName: quote.name || validated.companyName,
      },
    })

    revalidatePath('/dashboard/watchlist')

    return {
      success: true,
      data: {
        message: `Added ${validated.symbol} to watchlist`,
        watchlistItem,
      },
    }
  } catch (error) {
    console.error('Add to watchlist error:', error)
    
    // Check for duplicate entry
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: 'Stock is already in your watchlist' }
    }

    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to add to watchlist' }
  }
}

/**
 * Remove stock from watchlist
 */
export async function removeFromWatchlist(symbol: string): Promise<ActionResponse> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    // Delete from watchlist
    await prisma.watchlist.delete({
      where: {
        userId_symbol: {
          userId: session.user.id,
          symbol: symbol.toUpperCase(),
        },
      },
    })

    revalidatePath('/dashboard/watchlist')

    return {
      success: true,
      data: { message: `Removed ${symbol} from watchlist` },
    }
  } catch (error) {
    console.error('Remove from watchlist error:', error)
    
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to remove from watchlist' }
  }
}

/**
 * Get user's watchlist with live prices
 */
export async function getWatchlist(): Promise<ActionResponse> {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized. Please sign in.' }
    }

    // Fetch watchlist
    const watchlist = await prisma.watchlist.findMany({
      where: { userId: session.user.id },
      orderBy: { addedAt: 'desc' },
    })

    if (watchlist.length === 0) {
      return { success: true, data: [] }
    }

    // Fetch live prices for all symbols
    const symbols = watchlist.map((item) => item.symbol)
    const result = await getBatchQuotes(symbols)

    // Combine watchlist items with live quotes
    const watchlistWithPrices = watchlist.map((item) => {
      const quote = result.quotes.get(item.symbol)
      return {
        ...item,
        currentPrice: quote?.price || 0,
        change: quote?.change || 0,
        changePercent: quote?.changePercent || 0,
        volume: quote?.volume || 0,
      }
    })

    return { success: true, data: watchlistWithPrices }
  } catch (error) {
    console.error('Get watchlist error:', error)
    return { success: false, error: 'Failed to fetch watchlist' }
  }
}

/**
 * Check if stock is in user's watchlist
 */
export async function isInWatchlist(symbol: string): Promise<ActionResponse<boolean>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const item = await prisma.watchlist.findUnique({
      where: {
        userId_symbol: {
          userId: session.user.id,
          symbol: symbol.toUpperCase(),
        },
      },
    })

    return { success: true, data: !!item }
  } catch (error) {
    console.error('Check watchlist error:', error)
    return { success: false, error: 'Failed to check watchlist' }
  }
}

