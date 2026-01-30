import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, jobId, total, dueDate, status } = body

    // Validate required fields
    if (!clientId || !total || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, total, and dueDate are required' },
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

    // If jobId provided, validate it exists
    if (jobId) {
      const job = await db.jobs.findById(jobId)
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }
      if (job.clientId !== clientId) {
        return NextResponse.json(
          { error: 'Job does not belong to the specified client' },
          { status: 400 }
        )
      }
    }

    // Create invoice
    const invoice = await db.invoices.create({
      clientId,
      jobId: jobId || undefined,
      total: parseFloat(total),
      status: status || 'Draft',
      dueDate
    })

    return NextResponse.json({ success: true, invoice })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
