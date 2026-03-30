import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    // Send SMS to owner
    const clientName = `${client.firstName} ${client.lastName}`
    const smsMessage = `✅ ${clientName} has approved the quote for "${quote.title}" ($${quote.total.toFixed(2)}). They are now selecting a date.`

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const toPhone = process.env.NOTIFICATION_PHONE || process.env.OWNER_PHONE_NUMBER
    const fromPhone = process.env.TWILIO_PHONE_NUMBER

    if (accountSid && authToken && toPhone && fromPhone) {
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: toPhone, From: fromPhone, Body: smsMessage }),
      })
    }

    // Redirect to scheduling page
    return NextResponse.redirect(new URL(`/quote/${id}/schedule`, request.url))
  } catch (error) {
    console.error('Failed to approve quote:', error)
    return NextResponse.json({ error: 'Failed to approve quote' }, { status: 500 })
  }
}
