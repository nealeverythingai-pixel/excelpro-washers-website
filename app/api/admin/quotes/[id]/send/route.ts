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

    // Get client info
    const client = await db.clients.findById(quote.clientId)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // TODO: Send email with quote details using Resend
    // For now, just update status to Sent
    await db.quotes.updateStatus(id, 'Sent')

    console.log(`Quote ${id} sent to ${client.email}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Quote sent successfully' 
    })
  } catch (error) {
    console.error('Failed to send quote:', error)
    return NextResponse.json(
      { error: 'Failed to send quote' },
      { status: 500 }
    )
  }
}
