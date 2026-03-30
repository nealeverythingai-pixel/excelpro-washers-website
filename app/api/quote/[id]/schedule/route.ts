import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { date, time } = await request.json()

    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 })
    }

    const quote = await db.quotes.findById(id)
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const client = await db.clients.findById(quote.clientId)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const clientName = `${client.firstName} ${client.lastName}`

    // Build ISO start date string from date + time slot
    const [hourStr, period] = time.split(' ')
    let [hour, minute] = hourStr.split(':').map(Number)
    if (period === 'PM' && hour !== 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0
    const startDate = new Date(`${date}T${String(hour).padStart(2, '0')}:${String(minute || 0).padStart(2, '0')}:00`)

    // Create job — visible in admin and open to contractors
    const job = await db.jobs.create({
      clientId: quote.clientId,
      title: quote.title,
      description: `Booked via client quote approval. Client: ${clientName}. Services: ${quote.items.map(i => i.description).join(', ')}.`,
      status: 'Scheduled',
      startDate: startDate.toISOString(),
      total: quote.total,
      availableToContractors: true,
    })

    // Mark quote as converted
    await db.quotes.updateStatus(id, 'Converted')

    // SMS owner with booking details
    const smsMessage = `📅 Job Booked!\n${clientName} selected ${new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at ${time} for "${quote.title}" ($${quote.total.toFixed(2)}).\n\nJob is live on the contractor board.`

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

    return NextResponse.json({ success: true, jobId: job.id })
  } catch (error) {
    console.error('Failed to schedule job:', error)
    return NextResponse.json({ error: 'Failed to schedule job' }, { status: 500 })
  }
}
