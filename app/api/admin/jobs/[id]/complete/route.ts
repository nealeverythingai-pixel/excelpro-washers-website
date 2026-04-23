import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const job = await db.jobs.findById(id)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    const updated = await db.jobs.update(id, { ...job, status: 'Completed' })
    return NextResponse.json({ job: updated })
  } catch (error) {
    console.error('Failed to complete job:', error)
    return NextResponse.json({ error: 'Failed to complete job' }, { status: 500 })
  }
}
