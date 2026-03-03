import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import InvoicePDF from '@/lib/pdf/InvoicePDF'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get invoice
    const invoice = await db.invoices.findById(id)
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Get client
    const client = await db.clients.findById(invoice.clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get job if linked
    const jobResult = invoice.jobId ? await db.jobs.findById(invoice.jobId) : undefined
    const job = jobResult || null

    // Generate PDF stream
    const stream = await renderToStream(
      InvoicePDF({ invoice, client, job })
    )

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer)
    }
    const buffer = Buffer.concat(chunks)

    // Generate filename
    const invoiceNum = invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)
    const filename = `invoice-${invoiceNum}.pdf`

    // Return PDF with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
