interface NotificationData {
  leadName: string;
  email: string;
  phone: string;
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

    // Send SMS notification for hot and warm leads
    if (data.aiCategory !== 'cold' && (process.env.NOTIFICATION_PHONE || process.env.OWNER_PHONE_NUMBER)) {
      await this.sendSMSNotification(data);
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

      const emailHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${data.aiCategory === 'hot' ? '#dc2626' : data.aiCategory === 'warm' ? '#f59e0b' : '#3b82f6'}; 
                        color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .score-badge { display: inline-block; background: #10b981; color: white; 
                            padding: 8px 16px; border-radius: 20px; font-weight: bold; }
              .section { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #3b82f6; }
              .label { font-weight: bold; color: #6b7280; }
              .value { color: #111827; margin-top: 4px; }
              .ai-reasoning { background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b; }
              .cta-button { display: inline-block; background: #2563eb; color: white; 
                           padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${categoryEmoji} New Lead Submission</h1>
                <p>${urgencyClass}</p>
              </div>
              <div class="content">
                <div class="section">
                  <div class="label">AI Score</div>
                  <div style="margin-top: 10px;">
                    <span class="score-badge">${data.aiScore}/100 - ${data.aiCategory.toUpperCase()}</span>
                  </div>
                </div>

                <div class="section">
                  <div class="label">Contact Information</div>
                  <div class="value">
                    <strong>${data.leadName}</strong><br>
                    📧 ${data.email}<br>
                    📞 ${data.phone}
                  </div>
                </div>

                <div class="section">
                  <div class="label">Service Requested</div>
                  <div class="value">${data.service}</div>
                </div>

                <div class="section">
                  <div class="label">Message</div>
                  <div class="value">${data.message}</div>
                </div>

                <div class="ai-reasoning">
                  <div class="label">💭 AI Analysis</div>
                  <div class="value">${data.aiReasoning}</div>
                </div>

                <div class="section">
                  <div class="label">Financial</div>
                  <div class="value">
                    Estimated Value: <strong>$${data.estimatedValue}</strong><br>
                    Quote Generated: <strong>$${data.quoteTotal}</strong>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard/leads" class="cta-button">
                    View in Dashboard →
                  </a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

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
  private static async sendSMSNotification(data: NotificationData): Promise<void> {
    try {
      const leadEmoji = data.aiCategory === 'hot' ? '🔥' : '🌡️';
      const urgency = data.aiCategory === 'hot' ? 'CALL NOW!' : 'Follow up soon.';
      const message = `${leadEmoji} ${data.aiCategory.toUpperCase()} LEAD!\n\n` +
                     `${data.leadName}\n` +
                     `${data.phone}\n` +
                     `Score: ${data.aiScore}/100\n` +
                     `Value: $${data.estimatedValue}\n\n` +
                     `${urgency}`;

      console.log('📱 Sending SMS notification...');
      console.log(`   To: ${process.env.NOTIFICATION_PHONE || process.env.OWNER_PHONE_NUMBER}`);

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const toPhone = process.env.NOTIFICATION_PHONE || process.env.OWNER_PHONE_NUMBER;
      const fromPhone = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !toPhone || !fromPhone) {
        console.warn('⚠️ Twilio not fully configured for SMS');
        return;
      }

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: toPhone,
          From: fromPhone,
          Body: message,
        }),
      });

      if (!response.ok) {
        console.error('❌ SMS failed:', await response.text());
        return;
      }

      console.log('✅ SMS notification sent successfully!');

    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
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
