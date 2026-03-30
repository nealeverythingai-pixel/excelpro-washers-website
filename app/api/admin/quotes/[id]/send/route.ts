import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Resend } from 'resend'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quote = await db.quotes.findById(id)

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const client = await db.clients.findById(quote.clientId)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Build items rows
    const itemRows = quote.items.map(item => `
      <tr>
        <td style="padding:10px 16px;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6;">${item.description}</td>
        <td style="padding:10px 16px;font-size:14px;color:#374151;text-align:center;border-bottom:1px solid #f3f4f6;">${item.quantity}</td>
        <td style="padding:10px 16px;font-size:14px;color:#374151;text-align:right;border-bottom:1px solid #f3f4f6;">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding:10px 16px;font-size:14px;font-weight:600;color:#111827;text-align:right;border-bottom:1px solid #f3f4f6;">$${(item.unitPrice * item.quantity).toFixed(2)}</td>
      </tr>`).join('')

    const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Quote from ExcelPro Washers</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

    <!-- Logo -->
    <tr>
      <td align="center" style="padding-bottom:20px;">
        <img src="${SITE_URL}/logo-horizontal.svg" alt="ExcelPro Washers" width="160" style="display:block;height:auto;" />
      </td>
    </tr>

    <!-- Card -->
    <tr>
      <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- Blue header -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);padding:28px 32px;">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Quote #${quote.id.slice(0, 8).toUpperCase()}</p>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">📋 ${quote.title}</h1>
            </td>
          </tr>
        </table>

        <!-- Body -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:28px 32px;">

              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">Hi <strong>${client.firstName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">Thank you for reaching out to ExcelPro Washers. Please find your quote below. We would be happy to answer any questions you may have.</p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:20px;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:10px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:left;">Description</th>
                    <th style="padding:10px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:center;">Qty</th>
                    <th style="padding:10px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:right;">Unit Price</th>
                    <th style="padding:10px 16px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;text-align:right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="text-align:right;">
                    <span style="font-size:14px;color:#6b7280;">Quote Total: </span>
                    <span style="font-size:22px;font-weight:800;color:#0284c7;">$${quote.total.toFixed(2)}</span>
                  </td>
                </tr>
              </table>

              ${quote.notes ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px 16px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#0369a1;">Notes</p>
                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${quote.notes}</p>
                  </td>
                </tr>
              </table>` : ''}

              <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">If you have any questions or would like to proceed, please don't hesitate to contact us.</p>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">You can reach us at <a href="tel:3435740300" style="color:#0284c7;text-decoration:none;font-weight:600;">(343) 574-0300</a>.</p>

              <p style="margin:0;font-size:15px;color:#111827;">Warm regards,<br><strong>The ExcelPro Washers Team</strong></p>

            </td>
          </tr>
        </table>

        <!-- Approve CTA -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#f0f9ff;border-top:2px solid #0ea5e9;padding:24px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#0369a1;font-weight:600;">Happy with this quote?</p>
              <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">Click below to approve and select your preferred date.</p>
              <a href="${SITE_URL}/quote/${id}/approve" style="display:inline-block;background:#22c55e;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">✓ Approve Quote &amp; Book Date</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 0;text-align:center;">
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 16px;" />
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.8;">ExcelPro Washers &bull; 93 Dun Skipper Drive, Ottawa, ON K1X 0E8 &bull; <a href="tel:3435740300" style="color:#9ca3af;text-decoration:none;">(343) 574-0300</a></p>
        <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">This is a quote email sent on your behalf by ExcelPro Washers.</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ExcelPro Washers <noreply@excelprowashers.com>',
        to: client.email,
        subject: `Your Quote from ExcelPro Washers — ${quote.title}`,
        html: emailHTML,
      })
      console.log(`✅ Quote email sent to ${client.email}`)
    } else {
      console.warn('⚠️ RESEND_API_KEY not set — email not sent')
    }

    await db.quotes.updateStatus(id, 'Sent')

    return NextResponse.json({ success: true, message: 'Quote sent successfully' })
  } catch (error) {
    console.error('Failed to send quote:', error)
    return NextResponse.json({ error: 'Failed to send quote' }, { status: 500 })
  }
}
