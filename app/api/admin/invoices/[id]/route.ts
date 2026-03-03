import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { clientId, jobId, total, dueDate, status } = await request.json()

    // Validate required fields
    if (!clientId || !total || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, total, and dueDate are required' },
        { status: 400 }
      )
    }

    // Verify invoice exists
    const existingInvoice = await db.invoices.findById(id)
    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
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

    // If jobId provided, verify it exists and belongs to the client
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
          { error: 'Job does not belong to the selected client' },
          { status: 400 }
        )
      }
    }

    // Update the invoice
    const updatedInvoice = await db.invoices.update(id, {
      clientId,
      jobId: jobId || undefined,
      total,
      dueDate,
      status: status || existingInvoice.status,
    })

    return NextResponse.json({ invoice: updatedInvoice })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
