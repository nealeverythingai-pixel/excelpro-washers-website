/**
 * Hot Lead Notification System
 * 
 * Sends immediate alerts when high-value leads come in (score >80)
 * Supports SMS, Email, and Discord webhooks
 */

interface HotLeadNotification {
  leadId: string
  name: string
  phone: string
  email: string
  service: string
  score: number
  reasoning: string
  estimatedValue: number
  address?: string
}

/**
 * Send SMS notification via Twilio
 */
export async function sendHotLeadSMS(notification: HotLeadNotification): Promise<boolean> {
  try {
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('⚠️  Twilio not configured. Skipping SMS notification.');
      return false;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    const toPhone = process.env.OWNER_PHONE_NUMBER; // Your phone number

    const message = `🔥 HOT LEAD ALERT!

Score: ${notification.score}/100
Name: ${notification.name}
Phone: ${notification.phone}
Service: ${notification.service}
Value: $${notification.estimatedValue}

AI Says: ${notification.reasoning}

📞 CALL THEM NOW for highest conversion rate!

View details: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard/leads/${notification.leadId}`;

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: toPhone!,
        From: fromPhone!,
        Body: message,
      }),
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('❌ Twilio SMS failed:', responseData);
      return false;
    }

    console.log('✅ Hot lead SMS sent to:', toPhone);
    console.log('📱 Twilio Response:', responseData);
    return true;

  } catch (error) {
    console.error('❌ Failed to send hot lead SMS:', error);
    return false;
  }
}

/**
 * Send email notification
 */
export async function sendHotLeadEmail(notification: HotLeadNotification): Promise<boolean> {
  try {
    // For now, just log. You can integrate SendGrid, Resend, or other email service
    console.log('📧 Hot Lead Email Notification:');
    console.log(`   To: ${process.env.OWNER_EMAIL}`);
    console.log(`   Subject: 🔥 HOT LEAD ALERT - ${notification.name} (${notification.score}/100)`);
    console.log(`   Lead: ${notification.name} - ${notification.phone}`);
    console.log(`   Service: ${notification.service} - $${notification.estimatedValue}`);
    console.log(`   AI Analysis: ${notification.reasoning}`);
    
    // TODO: Implement email service (SendGrid, Resend, etc.)
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', { ... });
    
    return true;

  } catch (error) {
    console.error('❌ Failed to send hot lead email:', error);
    return false;
  }
}

/**
 * Send Discord webhook notification (fastest to set up!)
 */
export async function sendHotLeadDiscord(notification: HotLeadNotification): Promise<boolean> {
  try {
    if (!process.env.DISCORD_WEBHOOK_URL) {
      console.warn('⚠️  Discord webhook not configured. Skipping notification.');
      return false;
    }

    const embed = {
      title: '🔥 HOT LEAD ALERT!',
      description: `**${notification.name}** just submitted a high-value inquiry!\n\n**Call them NOW for highest conversion rate!**`,
      color: 0xff0000, // Red
      fields: [
        {
          name: '📊 AI Score',
          value: `**${notification.score}/100**`,
          inline: true
        },
        {
          name: '💰 Est. Value',
          value: `$${notification.estimatedValue}`,
          inline: true
        },
        {
          name: '📞 Phone',
          value: notification.phone,
          inline: true
        },
        {
          name: '📧 Email',
          value: notification.email,
          inline: true
        },
        {
          name: '🧹 Service',
          value: notification.service,
          inline: true
        },
        {
          name: '📍 Address',
          value: notification.address || 'Not provided',
          inline: true
        },
        {
          name: '🤖 AI Analysis',
          value: notification.reasoning,
          inline: false
        }
      ],
      footer: {
        text: 'ExcelPro AI Lead Qualifier'
      },
      timestamp: new Date().toISOString()
    };

    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: '@everyone 🚨 HOT LEAD - ACTION REQUIRED',
        embeds: [embed]
      })
    });

    if (!response.ok) {
      console.error('❌ Discord webhook failed:', await response.text());
      return false;
    }

    console.log('✅ Hot lead Discord notification sent');
    return true;

  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error);
    return false;
  }
}

/**
 * Master notification function - tries all configured channels
 */
export async function notifyHotLead(notification: HotLeadNotification): Promise<void> {
  console.log(`\n🔥🔥🔥 HOT LEAD DETECTED 🔥🔥🔥`);
  console.log(`   Score: ${notification.score}/100`);
  console.log(`   Name: ${notification.name}`);
  console.log(`   Phone: ${notification.phone}`);
  console.log(`   Value: $${notification.estimatedValue}`);
  console.log(`   AI Says: ${notification.reasoning}\n`);

  // Try all notification channels in parallel
  const results = await Promise.allSettled([
    sendHotLeadSMS(notification),
    sendHotLeadEmail(notification),
    sendHotLeadDiscord(notification)
  ]);

  const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  
  if (successful === 0) {
    console.warn('⚠️  No notification channels configured. Set up Twilio/Discord/Email for alerts.');
  } else {
    console.log(`✅ Hot lead notification sent via ${successful} channel(s)`);
  }
}

/**
 * Send follow-up reminder notification
 */
export async function notifyFollowUpDue(lead: {
  name: string
  phone: string
  service: string
  category: 'warm' | 'cold'
  lastContact: string
}): Promise<void> {
  console.log(`\n⏰ Follow-up reminder for ${lead.category} lead: ${lead.name}`);
  
  // For now just log, can expand to send reminders via Discord/Email
  // This would be called by a cron job or background worker
}
