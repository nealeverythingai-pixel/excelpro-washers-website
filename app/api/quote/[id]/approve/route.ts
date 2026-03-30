import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendTelegram } from '@/lib/telegram'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quote = await db.quotes.findById(id)

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const client = await db.clients.findById(quote.clientId)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Mark quote as approved
    await db.quotes.updateStatus(id, 'Approved')

    // Notify owner via Telegram
    const clientName = `${client.firstName} ${client.lastName}`
    await sendTelegram(
      `✅ <b>Quote Approved!</b>\n\n<b>${clientName}</b> approved the quote for "<b>${quote.title}</b>" ($${quote.total.toFixed(2)}).\n\nThey are now selecting a date.`
    )

    // Redirect to scheduling page
    return NextResponse.redirect(new URL(`/quote/${id}/schedule`, request.url))
  } catch (error) {
    console.error('Failed to approve quote:', error)
    return NextResponse.json({ error: 'Failed to approve quote' }, { status: 500 })
  }
}
