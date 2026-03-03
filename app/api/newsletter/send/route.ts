import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { subscribers } from '@/lib/db/subscribers';
import { campaigns } from '@/lib/db/subscribers';
import { siteConfig } from '@/lib/site';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SENDER = `ExcelPro Washers <${process.env.SENDER_EMAIL || 'onboarding@resend.dev'}>`;

/**
 * POST: Send a campaign to all active subscribers.
 * Requires admin password in request body.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, bodyHtml, password } = body;

    // Auth check
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!subject || !bodyHtml) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    if (!resend) {
      return NextResponse.json({ error: 'Email service not configured (RESEND_API_KEY missing)' }, { status: 503 });
    }

    // Get active subscribers
    const activeSubscribers = await subscribers.getActive();
    if (activeSubscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers to send to' }, { status: 400 });
    }

    // Save campaign
    const campaign = await campaigns.create({
      subject,
      body_html: bodyHtml,
      status: 'draft',
    });

    const { address } = siteConfig.business;
    const physicalAddress = `${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}`;

    let sentCount = 0;
    const errors: string[] = [];

    // Send to each subscriber (Resend batch limit is 100 per call)
    for (const subscriber of activeSubscribers) {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com'}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

      const fullHtml = `
        ${bodyHtml}
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <div style="text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.5;">
          <p>ExcelPro Washers &bull; ${physicalAddress}</p>
          <p>
            You received this because you subscribed to our newsletter.
            <br />
            <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      `;

      try {
        await resend.emails.send({
          from: SENDER,
          to: subscriber.email,
          subject,
          html: fullHtml,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });
        sentCount++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${subscriber.email}: ${msg}`);
      }
    }

    // Update campaign status
    if (campaign) {
      await campaigns.markSent(campaign.id, sentCount);
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: activeSubscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Campaign send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
