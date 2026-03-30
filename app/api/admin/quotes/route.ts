import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, title, items, total, status, taxRate, discount, subtotal } = body

    if (!clientId || !title || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const quote = await db.quotes.create({
      clientId,
      title,
      items,
      total,
      status: 'Draft',
      salesRepId: undefined,
    })

    // Auto-send email immediately
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com'
      await fetch(`${baseUrl}/api/admin/quotes/${quote.id}/send`, { method: 'POST' })
    } catch (sendErr) {
      console.error('Auto-send failed (non-critical):', sendErr)
    }

    return NextResponse.json({ success: true, quote })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
