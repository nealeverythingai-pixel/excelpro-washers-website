import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendTelegram } from '@/lib/telegram'
import { sendSMS } from '@/lib/sms'

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

    // Build local date+time string — stored as-is, no UTC conversion
    const [hourStr, period] = time.split(' ')
    let [hour, minute] = hourStr.split(':').map(Number)
    if (period === 'PM' && hour !== 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0
    const startDate = `${date}T${String(hour).padStart(2, '0')}:${String(minute || 0).padStart(2, '0')}:00`

    // Create job — visible in admin and open to contractors
    const job = await db.jobs.create({
      clientId: quote.clientId,
      title: quote.title,
      description: `Booked via client quote approval. Client: ${clientName}. Services: ${quote.items.map(i => i.description).join(', ')}.`,
      status: 'Scheduled',
      startDate: startDate,
      total: quote.total,
      availableToContractors: true,
    })

    // Mark quote as converted
    await db.quotes.updateStatus(id, 'Converted')

    // Send booking confirmation SMS to client
    if (client.phone) {
      await sendSMS(
        client.phone,
        `Hi ${client.firstName}! ✅ Your booking with ExcelPro Washers is confirmed.\n\nService: ${quote.title}\nDate: ${new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\nTime: ${time}\nAddress: ${client.address}\n\nQuestions? Call us at (343) 574-0300. Reply STOP to unsubscribe.`
      )
    }

    // Notify owner via Telegram
    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    await sendTelegram(
      `📅 <b>Job Booked!</b>\n\n<b>${clientName}</b> selected <b>${formattedDate} at ${time}</b> for "<b>${quote.title}</b>" ($${quote.total.toFixed(2)}).\n\nJob is live on the contractor board.`
    )

    return NextResponse.json({ success: true, jobId: job.id })
  } catch (error) {
    console.error('Failed to schedule job:', error)
    return NextResponse.json({ error: 'Failed to schedule job' }, { status: 500 })
  }
}
