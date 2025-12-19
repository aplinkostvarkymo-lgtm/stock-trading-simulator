import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { searchStocks } from '@/lib/stock-api'

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameter
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Search stocks
    const results = await searchStocks(query)

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Stock search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search stocks' },
      { status: 500 }
    )
  }
}

