import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { clientId, title, description, startDate, endDate, status, contractorId, total } = await request.json()

    // Validate required fields
    if (!clientId || !title || !startDate || !total) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId, title, startDate, and total are required' },
        { status: 400 }
      )
    }

    // Verify job exists
    const existingJob = await db.jobs.findById(id)
    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
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

    // If contractorId provided, verify contractor exists
    if (contractorId) {
      const contractor = await db.users.findById(contractorId)
      if (!contractor) {
        return NextResponse.json(
          { error: 'Contractor not found' },
          { status: 404 }
        )
      }
      if (contractor.role !== 'CONTRACTOR') {
        return NextResponse.json(
          { error: 'Selected user is not a contractor' },
          { status: 400 }
        )
      }
    }

    // Update the job
    const updatedJob = await db.jobs.update(id, {
      clientId,
      title,
      description: description || existingJob.description,
      startDate,
      endDate: endDate || existingJob.endDate,
      status: status || existingJob.status,
      contractorId: contractorId || existingJob.contractorId,
      total,
    })

    return NextResponse.json({ job: updatedJob })
  } catch (error) {
    console.error('Failed to update job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const job = await db.jobs.findById(id)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Failed to fetch job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}
