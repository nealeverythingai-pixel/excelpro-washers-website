import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await db.requests.findById(params.id)
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Create client from lead
    const client = await db.clients.create({
      firstName: lead.firstName || lead.name?.split(' ')[0] || '',
      lastName: lead.lastName || lead.name?.split(' ').slice(1).join(' ') || '',
      email: lead.email,
      phone: lead.phone,
      address: lead.address || '',
      companyName: '',
      createdAt: new Date().toISOString()
    })

    // Update lead status to Converted
    await db.requests.updateStatus(params.id, 'Converted')

    return NextResponse.json({ 
      success: true, 
      client,
      message: 'Lead converted to client successfully' 
    })
  } catch (error) {
    console.error('Failed to convert lead:', error)
    return NextResponse.json(
      { error: 'Failed to convert lead' },
      { status: 500 }
    )
  }
}
