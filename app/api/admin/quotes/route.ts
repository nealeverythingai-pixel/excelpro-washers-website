import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, title, items, total, status, taxRate, discount, subtotal } = body

    // Validate required fields
    if (!clientId || !title || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create quote
    const quote = await db.quotes.create({
      clientId,
      title,
      items, // Array of { description, quantity, unitPrice }
      total,
      status: status || 'Draft',
      salesRepId: undefined, // TODO: Get from session when auth is implemented
    })

    return NextResponse.json({ success: true, quote })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}
