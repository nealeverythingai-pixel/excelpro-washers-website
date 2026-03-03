import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, title, description, startDate, endDate, total, status, contractorId } = body

    // Validate required fields
    if (!clientId || !title || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, title, and startDate are required' },
        { status: 400 }
      )
    }

    // Validate client exists
    const client = await db.clients.findById(clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Create job
    const job = await db.jobs.create({
      clientId,
      title,
      description: description || undefined,
      status: status || 'Scheduled',
      startDate,
      endDate: endDate || undefined,
      total: total || 0,
      contractorId: contractorId || undefined,
      availableToContractors: true, // Make available to contractor portal
      contractorEarnings: Math.round((total || 0) * 0.7), // 70% goes to contractor
    })

    // Trigger contractor notifications (async, don't await)
    console.log(`🔔 Triggering contractor notifications for job ${job.id}`)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/jobs/notify-contractors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id }),
    }).catch(err => console.error('Failed to notify contractors:', err))

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
