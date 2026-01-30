import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get invoice and client details
    const invoice = await db.invoices.findById(id)
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const client = await db.clients.findById(invoice.clientId)
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Calculate days overdue
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Send payment reminder email
    await resend.emails.send({
      from: 'ExcelPro Washers <noreply@excelprowashers.com>',
      to: client.email,
      subject: `Payment Reminder: Invoice INV-${invoice.id.toUpperCase().slice(0, 6)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Payment Reminder</h2>
          <p>Dear ${client.firstName} ${client.lastName},</p>
          <p>This is a friendly reminder that invoice <strong>INV-${invoice.id.toUpperCase().slice(0, 6)}</strong> is currently ${daysOverdue} days overdue.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Invoice Amount:</strong> $${invoice.total.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Days Overdue:</strong> ${daysOverdue} days</p>
          </div>

          <p>Please arrange payment at your earliest convenience to avoid any service interruptions.</p>
          
          <p>If you have already made payment, please disregard this notice. If you have any questions or concerns, feel free to contact us.</p>
          
          <p>Thank you for your business!</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>ExcelPro Washers</strong><br>
            Phone: (555) 123-4567<br>
            Email: billing@excelprowashers.com
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'Reminder sent successfully' })
  } catch (error) {
    console.error('Error sending payment reminder:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}
