interface NotificationData {
  leadName: string;
  email: string;
  phone: string;
  address?: string;
  service: string;
  message: string;
  aiScore: number;
  aiCategory: 'hot' | 'warm' | 'cold';
  aiReasoning: string;
  estimatedValue: number;
  quoteTotal: number;
}

/**
 * Alternative NotificationService using Resend (simpler, more reliable)
 * 
 * To use this instead of Gmail:
 * 1. Rename this file to NotificationService.ts
 * 2. Backup the original NotificationService.ts
 * 3. Add to .env.local: NOTIFICATION_EMAIL=your-email@gmail.com
 * 4. That's it! No SMTP settings needed.
 */
export class NotificationService {
  /**
   * Send real-time notification for new lead
   */
  static async notifyNewLead(data: NotificationData): Promise<void> {
    // Log to console for immediate visibility
    console.log('\n' + '='.repeat(80));
    console.log('🔔 NEW LEAD SUBMISSION - AI ANALYSIS');
    console.log('='.repeat(80));
    console.log(`👤 Name: ${data.leadName}`);
    console.log(`📧 Email: ${data.email}`);
    console.log(`📞 Phone: ${data.phone}`);
    console.log(`🛠️  Service: ${data.service}`);
    console.log(`💬 Message: ${data.message}`);
    console.log('-'.repeat(80));
    console.log(`🤖 AI SCORE: ${data.aiScore}/100`);
    console.log(`📊 CATEGORY: ${data.aiCategory.toUpperCase()}`);
    console.log(`💭 REASONING: ${data.aiReasoning}`);
    console.log(`💰 ESTIMATED VALUE: $${data.estimatedValue}`);
    console.log(`💵 QUOTE TOTAL: $${data.quoteTotal}`);
    console.log('='.repeat(80) + '\n');

    // Send email notification using Resend
    if (process.env.NOTIFICATION_EMAIL && process.env.RESEND_API_KEY) {
      await this.sendResendNotification(data);
    }

    // Send Telegram notification for hot and warm leads
    if (data.aiCategory !== 'cold' && process.env.TELEGRAM_BOT_TOKEN) {
      await this.sendTelegramNotification(data);
    }

    // Send Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackNotification(data);
    }
  }

  /**
   * Send email notification using Resend (already configured!)
   */
  private static async sendResendNotification(data: NotificationData): Promise<void> {
    try {
      const categoryEmoji = data.aiCategory === 'hot' ? '🔥' :
                           data.aiCategory === 'warm' ? '🌡️' : '❄️';
      
      const urgencyClass = data.aiCategory === 'hot' ? 'HIGH PRIORITY' :
                          data.aiCategory === 'warm' ? 'MEDIUM PRIORITY' : 'LOW PRIORITY';

      const accentColor = data.aiCategory === 'hot' ? '#dc2626' : data.aiCategory === 'warm' ? '#f59e0b' : '#3b82f6';
      const scoreBg = data.aiCategory === 'hot' ? '#fef2f2' : data.aiCategory === 'warm' ? '#fffbeb' : '#eff6ff';
      const scoreText = data.aiCategory === 'hot' ? '#dc2626' : data.aiCategory === 'warm' ? '#d97706' : '#2563eb';

      const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Lead — ExcelPro Washers</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

    <!-- Header -->
    <tr>
      <td style="background:${accentColor};border-radius:16px 16px 0 0;padding:28px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">ExcelPro Washers CRM</p>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${categoryEmoji} New Lead — ${urgencyClass}</h1>
            </td>
            <td align="right" style="white-space:nowrap;">
              <div style="background:rgba(255,255,255,0.2);border-radius:12px;padding:10px 16px;text-align:center;">
                <div style="color:#ffffff;font-size:22px;font-weight:800;line-height:1;">${data.aiScore}</div>
                <div style="color:rgba(255,255,255,0.85);font-size:11px;font-weight:600;">/ 100</div>
                <div style="color:rgba(255,255,255,0.85);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${data.aiCategory}</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body card -->
    <tr>
      <td style="background:#ffffff;border-radius:0 0 16px 16px;padding:28px 32px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- Contact block -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="padding-bottom:8px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Contact</p>
              <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111827;">${data.leadName}</p>
              <p style="margin:0 0 3px;font-size:14px;color:#6b7280;">📧 <a href="mailto:${data.email}" style="color:#2563eb;text-decoration:none;">${data.email}</a></p>
              <p style="margin:0 0 3px;font-size:14px;color:#6b7280;">📞 <a href="tel:${data.phone}" style="color:#2563eb;text-decoration:none;">${data.phone}</a></p>
              ${data.address ? `<p style="margin:0;font-size:14px;color:#6b7280;">📍 ${data.address}</p>` : ''}
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6;padding-top:20px;margin-bottom:20px;">
          <tr>
            <td width="50%" style="padding-right:12px;vertical-align:top;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Service Requested</p>
              <p style="margin:0;font-size:14px;color:#111827;font-weight:500;">${data.service.replace(/-/g, ' ').replace(/,/g, ', ')}</p>
            </td>
            <td width="50%" style="padding-left:12px;vertical-align:top;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Estimated Value</p>
              <p style="margin:0;font-size:20px;font-weight:800;color:#111827;">$${data.estimatedValue}</p>
            </td>
          </tr>
        </table>

        <!-- Message -->
        ${data.message ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="background:#f9fafb;border-left:3px solid ${accentColor};border-radius:0 8px 8px 0;padding:14px 16px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;">Their Message</p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${data.message}</p>
            </td>
          </tr>
        </table>` : ''}

        <!-- AI Analysis -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="background:${scoreBg};border-radius:10px;padding:14px 16px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:${scoreText};">🤖 AI Analysis</p>
              <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${data.aiReasoning}</p>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard/leads" style="display:inline-block;background:#0284c7;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">View Lead in Dashboard →</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:16px 0;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">ExcelPro Washers · Admin Notification · Do not reply to this email</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

      console.log('📧 Sending email via Resend...');
      console.log(`   To: ${process.env.NOTIFICATION_EMAIL}`);

      // Use Resend API
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ExcelPro CRM <onboarding@resend.dev>',
        to: process.env.NOTIFICATION_EMAIL!,
        subject: `${categoryEmoji} New ${data.aiCategory.toUpperCase()} Lead: ${data.leadName}`,
        html: emailHTML,
      });

      console.log('✅ Email notification sent successfully via Resend!');

    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send SMS notification for hot leads
   */
  private static async sendTelegramNotification(data: NotificationData): Promise<void> {
    const { sendTelegram } = await import('@/lib/telegram');
    const isHot = data.aiCategory === 'hot';
    const leadEmoji = isHot ? '🔥' : '🌡️';
    const action = isHot ? 'Call immediately.' : 'Follow up within the hour.';
    const message =
      `${leadEmoji} <b>New ${data.aiCategory.charAt(0).toUpperCase() + data.aiCategory.slice(1)} Lead</b> — $${data.estimatedValue} est.\n\n` +
      `<b>${data.leadName}</b>\n` +
      `📞 ${data.phone}\n` +
      `📧 ${data.email}\n` +
      (data.address ? `📍 ${data.address}\n` : '') +
      `\nService: ${data.service}\n` +
      `AI Score: ${data.aiScore}/100\n\n` +
      `${action}`;
    await sendTelegram(message);
  }

  /**
   * Send Slack notification
   */
  private static async sendSlackNotification(data: NotificationData): Promise<void> {
    try {
      const color = data.aiCategory === 'hot' ? '#dc2626' :
                   data.aiCategory === 'warm' ? '#f59e0b' : '#3b82f6';
      
      const categoryEmoji = data.aiCategory === 'hot' ? ':fire:' :
                           data.aiCategory === 'warm' ? ':sunny:' : ':snowflake:';

      const slackMessage = {
        text: `${categoryEmoji} New ${data.aiCategory.toUpperCase()} Lead: ${data.leadName}`,
        attachments: [
          {
            color: color,
            fields: [
              { title: 'AI Score', value: `${data.aiScore}/100`, short: true },
              { title: 'Category', value: data.aiCategory.toUpperCase(), short: true },
              { title: 'Name', value: data.leadName, short: true },
              { title: 'Phone', value: data.phone, short: true },
              { title: 'Service', value: data.service, short: false },
              { title: 'Estimated Value', value: `$${data.estimatedValue}`, short: true },
              { title: 'Quote', value: `$${data.quoteTotal}`, short: true },
              { title: 'AI Reasoning', value: data.aiReasoning, short: false }
            ],
            footer: 'ExcelPro Washers CRM',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      if (process.env.SLACK_WEBHOOK_URL) {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage)
        });
        console.log('✅ Slack notification sent');
      }

    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Log AI decision for performance tracking
   */
  static async logAIDecision(data: {
    leadId: string;
    inputData: any;
    outputData: any;
  }): Promise<void> {
    try {
      const { leadAIFeedback } = await import('@/lib/db/leads');
      
      await leadAIFeedback.create({
        agent_type: 'lead-qualifier',
        input_data: data.inputData,
        output_data: data.outputData,
        actual_outcome: 'pending',
        metadata: {
          leadId: data.leadId,
          notificationSent: true,
          notifiedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Failed to log AI decision:', error);
    }
  }
}
