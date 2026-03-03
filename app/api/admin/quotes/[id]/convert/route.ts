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
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    if (quote.status !== 'Approved') {
      return NextResponse.json(
        { error: 'Only approved quotes can be converted to jobs' },
        { status: 400 }
      )
    }

    // Create job from quote
    const job = await db.jobs.create({
      clientId: quote.clientId,
      title: quote.title,
      description: `Converted from Quote #${quote.id.slice(0, 8)}`,
      status: 'Scheduled',
      startDate: new Date().toISOString(),
      total: quote.total,
      availableToContractors: true, // Make available to contractors
      contractorEarnings: Math.round(quote.total * 0.7) // 70% to contractor
    })

    // Update quote status to Converted
    await db.quotes.updateStatus(id, 'Converted')

    // Trigger contractor notifications (async, don't await)
    console.log(`🔔 Triggering contractor notifications for job ${job.id}`)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/jobs/notify-contractors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id }),
    }).catch(err => console.error('Failed to notify contractors:', err))

    return NextResponse.json({ 
      success: true, 
      job,
      message: 'Quote converted to job successfully' 
    })
  } catch (error) {
    console.error('Failed to convert quote:', error)
    return NextResponse.json(
      { error: 'Failed to convert quote' },
      { status: 500 }
    )
  }
}
