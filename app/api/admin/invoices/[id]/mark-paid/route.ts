import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { paymentDate } = body

    // Update invoice status to Paid
    const updated = await db.invoices.updateStatus(id, 'Paid')

    if (!updated) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, invoice: updated })
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}
