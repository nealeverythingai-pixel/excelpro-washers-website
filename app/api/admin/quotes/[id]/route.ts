import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const quote = await db.quotes.findById(params.id)
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    const updatedQuote = await db.quotes.updateStatus(params.id, status)

    return NextResponse.json(updatedQuote)
  } catch (error) {
    console.error('Failed to update quote:', error)
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { clientId, title, items, total, status } = await request.json()

    // Validate required fields
    if (!clientId || !title || !items || items.length === 0 || !total) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, title, items, and total are required' },
        { status: 400 }
      )
    }

    // Verify quote exists
    const existingQuote = await db.quotes.findById(params.id)
    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Verify quote is not converted
    if (existingQuote.status === 'Converted') {
      return NextResponse.json(
        { error: 'Cannot edit a converted quote' },
        { status: 400 }
      )
    }

    // Verify client exists
    const client = await db.clients.findById(clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Validate line items
    for (const item of items) {
      if (!item.description || item.quantity === undefined || item.unitPrice === undefined) {
        return NextResponse.json(
          { error: 'Each line item must have description, quantity, and unitPrice' },
          { status: 400 }
        )
      }
    }

    // Update the quote
    const updatedQuote = await db.quotes.update(params.id, {
      clientId,
      title,
      items,
      total,
      status: status || existingQuote.status,
    })

    return NextResponse.json({ quote: updatedQuote })
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quote = await db.quotes.findById(params.id)
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Failed to fetch quote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    )
  }
}
