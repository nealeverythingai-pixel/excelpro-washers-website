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
 * Send email notification via Resend
 */
export async function sendHotLeadEmail(notification: HotLeadNotification): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) {
      console.warn('⚠️  Resend not configured (RESEND_API_KEY + NOTIFICATION_EMAIL needed). Skipping email.');
      return false;
    }

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = `
      <h2>🔥 HOT LEAD ALERT!</h2>
      <p><strong>Score:</strong> ${notification.score}/100</p>
      <p><strong>Name:</strong> ${notification.name}</p>
      <p><strong>Phone:</strong> ${notification.phone}</p>
      <p><strong>Email:</strong> ${notification.email}</p>
      <p><strong>Service:</strong> ${notification.service}</p>
      <p><strong>Value:</strong> $${notification.estimatedValue}</p>
      <p><strong>AI Says:</strong> ${notification.reasoning}</p>
      <p><strong>📞 CALL THEM NOW for highest conversion rate!</strong></p>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'ExcelPro CRM <onboarding@resend.dev>',
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🔥 HOT LEAD: ${notification.name} (${notification.score}/100)`,
      html,
    });

    console.log('✅ Hot lead email sent to:', process.env.NOTIFICATION_EMAIL);
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

