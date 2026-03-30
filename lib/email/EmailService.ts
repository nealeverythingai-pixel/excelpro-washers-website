/**
 * Email Service using Resend
 * Handles all email sending operations
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://excelprowashers.com';
const PHYSICAL_ADDRESS = '123 Main St, Ottawa, ON K1A 0B1, Canada';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static readonly DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'ExcelPro Washers <onboarding@resend.dev>';

  /**
   * Generate CAN-SPAM compliant footer with unsubscribe link
   */
  private static complianceFooter(recipientEmail: string, isTransactional = false): string {
    const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
    
    return `
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <div style="text-align: center; color: #9ca3af; font-size: 12px; line-height: 1.8; padding: 0 20px;">
        <p style="margin: 0;">ExcelPro Washers &bull; ${PHYSICAL_ADDRESS}</p>
        <p style="margin: 4px 0 0 0;">
          ${isTransactional 
            ? 'This is a transactional email related to your service request.' 
            : `You received this because you subscribed or requested a quote.`}
          <br />
          <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from marketing emails</a>
        </p>
      </div>
    `;
  }

  /**
   * Send an email using Resend
   */
  static async send(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not configured - email NOT sent');
        console.log('📧 Would have sent email:', {
          to: options.to,
          subject: options.subject,
        });
        return { success: false, error: 'RESEND_API_KEY not configured' };
      }

      const { data, error } = await resend.emails.send({
        from: options.from || this.DEFAULT_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        headers: {
          'List-Unsubscribe': `<${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(options.to)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      if (error) {
        console.error('❌ Email send failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Email sent successfully:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error: any) {
      console.error('❌ Email service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send instant quote email to customer
   */
  static async sendInstantQuote(params: {
    name: string;
    email: string;
    service: string;
    estimatedValue: number;
    details?: string;
    leadCategory?: 'hot' | 'warm' | 'cold';
    requestId?: string;
  }): Promise<boolean> {
    const services = params.service.split(',').map(s => s.trim());
    const requestNumber = params.requestId || `REQ-${Date.now()}`;
    const requestTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    // Calculate expected callback time based on lead category
    const isUrgent = params.leadCategory === 'hot';
    const responseMinutes = isUrgent ? 30 : 120;
    const callbackTime = new Date(Date.now() + responseMinutes * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .price-box { background: white; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .price { font-size: 36px; font-weight: bold; color: #0ea5e9; }
    .service-list { list-style: none; padding: 0; }
    .service-list li { padding: 8px 0; padding-left: 25px; position: relative; }
    .service-list li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
    .cta-button { display: inline-block; background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .discount { background: #10b981; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .timeline { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .timeline-step { display: flex; align-items: flex-start; margin: 15px 0; }
    .timeline-number { background: #0ea5e9; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; margin-right: 15px; }
    .priority-banner { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪟 Your ExcelPro Washers Quote</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${params.name}</strong>,</p>
      
      <p>Thanks for reaching out about our services! We've reviewed your request and here's your personalized estimate:</p>
      
      <div class="price-box">
        <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">PRICING</div>
        <div style="font-size: 18px; font-weight: 600; color: #111827; margin: 8px 0;">Confirmed after property review</div>
        <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">We'll give you an exact price when we connect — no surprises.</div>
      </div>
      
      <h3>📋 Services Included:</h3>
      <ul class="service-list">
        ${services.map(s => `<li>${s}</li>`).join('')}
        <li>Professional-grade equipment</li>
        <li>100% satisfaction guarantee</li>
        <li>Fully insured & bonded</li>
      </ul>
      
      ${services.length >= 2 ? '<div class="discount">🎉 <strong>Multi-Service Discount Applied!</strong> You\'re saving 5-10% by bundling services.</div>' : ''}
      
      ${isUrgent ? `
      <div class="priority-banner">
        🔥 HIGH PRIORITY REQUEST 🔥<br>
        Your request shows urgency - expect our call within 30 minutes!
      </div>
      ` : ''}
      
      <div class="timeline">
        <h3 style="margin-top: 0;">⏰ What Happens Next:</h3>
        <p style="background: #f3f4f6; padding: 10px; border-radius: 6px; margin: 10px 0;">
          <strong>Request #${requestNumber}</strong> received at <strong>${requestTime}</strong><br>
          ✅ We'll call you before <strong>${callbackTime}</strong>
        </p>
        
        <div class="timeline-step">
          <div class="timeline-number">1</div>
          <div>
            <strong>Request Received</strong><br>
            <span style="color: #6b7280;">Your quote has been generated and our team notified</span>
          </div>
        </div>
        
        <div class="timeline-step">
          <div class="timeline-number">2</div>
          <div>
            <strong>Personal Call</strong><br>
            <span style="color: #6b7280;">We'll call within ${isUrgent ? '30 minutes' : '2 hours'} to confirm details and answer questions</span>
          </div>
        </div>
        
        <div class="timeline-step">
          <div class="timeline-number">3</div>
          <div>
            <strong>Photo Confirmation</strong><br>
            <span style="color: #6b7280;">Send 2-3 photos for the most accurate final quote</span>
          </div>
        </div>
        
        <div class="timeline-step">
          <div class="timeline-number">4</div>
          <div>
            <strong>Final Quote & Booking</strong><br>
            <span style="color: #6b7280;">Review exact pricing and schedule your service</span>
          </div>
        </div>
        
        <div class="timeline-step">
          <div class="timeline-number">5</div>
          <div>
            <strong>Service Completion</strong><br>
            <span style="color: #6b7280;">We arrive on time, transform your property, and guarantee satisfaction</span>
          </div>
        </div>
      </div>
      
      <h3>🎯 Ready to Get Started?</h3>
      <div style="text-align: center;">
        <a href="tel:${process.env.OWNER_PHONE_NUMBER}" class="cta-button">📞 Call/Text: ${process.env.OWNER_PHONE_NUMBER}</a>
      </div>
      
      <p><strong>Pro Tip:</strong> Have photos ready when we call for the most accurate quote!</p>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
        <strong>⏰ Book within 48 hours:</strong> Get 10% off your final invoice!<br>
        <small>Mention code: <strong>QUICK10</strong></small>
      </div>
      
      <p>Looking forward to making your property shine! ✨</p>
      
      <p>Best regards,<br>
      <strong>ExcelPro Washers Team</strong><br>
      📱 ${process.env.OWNER_PHONE_NUMBER}</p>
      
      <div class="footer">
        <p>Reference #: ${requestNumber}</p>
        <p>Questions? Reply to this email or call us at ${process.env.OWNER_PHONE_NUMBER}</p>
      </div>
      ${this.complianceFooter(params.email, true)}
    </div>
  </div>
</body>
</html>
    `;

    const result = await this.send({
      to: params.email,
      subject: `Your ExcelPro Washers Quote`,
      html,
    });

    return result.success;
  }

  /**
   * Send educational content to cold leads
   */
  static async sendEducationalEmail(params: {
    name: string;
    email: string;
    service: string;
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .info-box { background: white; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
    .price-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .price-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪟 Window Cleaning 101</h1>
      <p>Everything you need to know</p>
    </div>
    <div class="content">
      <p>Hi <strong>${params.name}</strong>,</p>
      
      <p>Thanks for asking about our ${params.service} services! I noticed you didn't provide many details, so let me share some helpful information to help you decide.</p>
      
      <div class="info-box">
        <h3>💰 How We Price Services:</h3>
        <table class="price-table">
          <tr>
            <td><strong>Window Cleaning</strong></td>
            <td></td>
          </tr>
          <tr>
            <td>• Small windows</td>
            <td style="text-align: right;">$5 each</td>
          </tr>
          <tr>
            <td>• Normal windows</td>
            <td style="text-align: right;">$10 each</td>
          </tr>
          <tr>
            <td>• Large windows</td>
            <td style="text-align: right;">$15 each</td>
          </tr>
          <tr>
            <td><strong>Average home (20 windows)</strong></td>
            <td style="text-align: right;"><strong>$200-250</strong></td>
          </tr>
        </table>
        
        <table class="price-table" style="margin-top: 20px;">
          <tr>
            <td><strong>Pressure Washing</strong></td>
            <td style="text-align: right;"><strong>$0.50/sq ft</strong></td>
          </tr>
          <tr>
            <td><strong>Gutter Cleaning</strong></td>
            <td style="text-align: right;"><strong>$200</strong></td>
          </tr>
          <tr>
            <td><strong>Soft Washing</strong></td>
            <td style="text-align: right;"><strong>$0.50/sq ft</strong></td>
          </tr>
        </table>
      </div>
      
      <h3>📋 What We Need for an Exact Quote:</h3>
      <ul>
        <li>Number of stories (1, 2, or 3?)</li>
        <li>Approximate window count or square footage</li>
        <li>Any special access needs (ladder, high windows)</li>
        <li>Preferred timing (this week, next month, etc.)</li>
      </ul>
      
      <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
        <strong>💡 Pro Tip:</strong> Most homeowners clean windows 2x per year (spring & fall) for best results and to prevent buildup that can damage glass over time.
      </div>
      
      <h3>✅ Why Choose ExcelPro Washers?</h3>
      <ul>
        <li>✓ Fully insured & bonded ($2M coverage)</li>
        <li>✓ 100% satisfaction guarantee or free re-clean</li>
        <li>✓ Eco-friendly cleaning products</li>
        <li>✓ Flexible scheduling (weekends available)</li>
        <li>✓ Same-day service for urgent requests</li>
      </ul>
      
      <h3>🎯 Want a Personalized Quote?</h3>
      <p>Just reply to this email with:</p>
      <ol>
        <li>How many stories is your home?</li>
        <li>Rough estimate of windows (10? 20? 30+?)</li>
        <li>When are you looking to get this done?</li>
      </ol>
      
      <p>Or call/text me directly at <strong>${process.env.OWNER_PHONE_NUMBER}</strong> - I typically respond within an hour!</p>
      
      <p>No pressure - I'm here to help! 😊</p>
      
      <p>Best,<br>
      <strong>ExcelPro Washers Team</strong></p>
      
      <div class="footer">
        <p>Questions? Just reply to this email or call ${process.env.OWNER_PHONE_NUMBER}</p>
      </div>
      ${this.complianceFooter(params.email)}
    </div>
  </div>
</body>
</html>
    `;

    const result = await this.send({
      to: params.email,
      subject: 'Window Cleaning 101: What You Need to Know',
      html,
    });

    return result.success;
  }

  /**
   * Send follow-up email to warm leads
   */
  static async sendFollowUp(params: {
    name: string;
    email: string;
    service: string;
    daysSince: number;
  }): Promise<boolean> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { padding: 20px; }
    .cta-button { display: inline-block; background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi <strong>${params.name}</strong>,</p>
      
      <p>I sent over your ${params.service} quote a few days ago. Did you have any questions?</p>
      
      <p><strong>A few things customers often ask:</strong></p>
      <ul>
        <li>✅ We're fully insured & bonded</li>
        <li>✅ 100% satisfaction guarantee or free re-clean</li>
        <li>✅ Flexible scheduling (weekends available)</li>
        <li>✅ Same-day service for urgent requests</li>
      </ul>
      
      <p>Still interested? I have slots available this week and would love to help!</p>
      
      <div style="text-align: center;">
        <a href="tel:${process.env.OWNER_PHONE_NUMBER}" class="cta-button">📞 Call/Text: ${process.env.OWNER_PHONE_NUMBER}</a>
      </div>
      
      <p>Let me know if you need anything!</p>
      
      <p>Best,<br>
      <strong>ExcelPro Washers</strong></p>
      ${this.complianceFooter(params.email)}
    </div>
  </div>
</body>
</html>
    `;

    const result = await this.send({
      to: params.email,
      subject: 'Quick question about your quote',
      html,
    });

    return result.success;
  }

  /**
   * Send special offer SMS-style notification
   */
  static async sendSpecialOffer(params: {
    name: string;
    email: string;
    service: string;
    originalPrice: number;
  }): Promise<boolean> {
    const discountPrice = Math.round(params.originalPrice * 0.85); // 15% off

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { padding: 20px; }
    .offer-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; }
    .price-strike { text-decoration: line-through; opacity: 0.7; font-size: 24px; }
    .price-new { font-size: 48px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi <strong>${params.name}</strong>! 👋</p>
      
      <p>Great news! I have an unexpected opening this week and wanted to offer you a special deal on your ${params.service}.</p>
      
      <div class="offer-box">
        <h2 style="margin-top: 0;">🎉 LIMITED TIME OFFER</h2>
        <div class="price-strike">$${params.originalPrice}</div>
        <div class="price-new">$${discountPrice}</div>
        <p style="font-size: 18px; margin-bottom: 0;">15% OFF - This Week Only!</p>
      </div>
      
      <p><strong>To claim this offer, reply to this email or text me "YES" at ${process.env.OWNER_PHONE_NUMBER} by Friday.</strong></p>
      
      <p>Slots are limited and booking up fast!</p>
      
      <p>Talk soon,<br>
      <strong>ExcelPro Washers</strong><br>
      📱 ${process.env.OWNER_PHONE_NUMBER}</p>
      ${this.complianceFooter(params.email)}
    </div>
  </div>
</body>
</html>
    `;

    const result = await this.send({
      to: params.email,
      subject: `🎉 15% OFF Your ${params.service} - Limited Time!`,
      html,
    });

    return result.success;
  }

  /**
   * Send instant confirmation email to every customer who submits the contact form
   */
  static async sendConfirmation(params: {
    name: string;
    email: string;
    service: string;
    message?: string;
  }): Promise<boolean> {
    const firstName = params.name.split(' ')[0];
    const services = params.service.split(',').map(s => s.trim()).filter(Boolean);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Request Received — ExcelPro Washers</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Main card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

              <!-- Blue header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%);padding:28px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${SITE_URL}/logo-horizontal.svg" alt="ExcelPro Washers" width="130" style="display:block;height:auto;" />
                        </td>
                        <td style="vertical-align:middle;text-align:right;">
                          <div style="background:rgba(255,255,255,0.15);display:inline-block;border-radius:50%;width:44px;height:44px;line-height:44px;font-size:22px;margin-bottom:6px;">&#10003;</div>
                          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Request Received!</h1>
                          <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">We'll be in touch shortly.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px;">

                    <p style="margin:0 0 16px;font-size:16px;color:#18181b;">Hi <strong>${firstName}</strong>,</p>
                    <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">Thanks for contacting us! We've received your request and a member of our team will review it and reach out to you very soon.</p>

                    <!-- Services requested -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;margin-bottom:${params.message ? '20px' : '24px'};">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;">Service${services.length > 1 ? 's' : ''} Requested</p>
                          ${services.map(s => `<div style="display:flex;align-items:center;margin:4px 0;"><span style="color:#0ea5e9;font-weight:700;margin-right:8px;">&#10003;</span><span style="font-size:15px;color:#18181b;">${s}</span></div>`).join('')}
                        </td>
                      </tr>
                    </table>

                    ${params.message ? `
                    <!-- Customer message -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #e4e4e7;border-left:3px solid #0ea5e9;border-radius:0 8px 8px 0;margin-bottom:24px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Your Message</p>
                          <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.6;">${params.message}</p>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <!-- What happens next -->
                    <p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#18181b;">What happens next:</p>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;vertical-align:top;padding-top:2px;">
                                <div style="background:#e0f2fe;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0284c7;">1</div>
                              </td>
                              <td style="padding-left:12px;">
                                <p style="margin:0;font-size:14px;font-weight:600;color:#18181b;">Request Review</p>
                                <p style="margin:2px 0 0;font-size:13px;color:#71717a;">We review your details and prepare a personalized quote</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;vertical-align:top;padding-top:2px;">
                                <div style="background:#e0f2fe;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0284c7;">2</div>
                              </td>
                              <td style="padding-left:12px;">
                                <p style="margin:0;font-size:14px;font-weight:600;color:#18181b;">We'll Reach Out</p>
                                <p style="margin:2px 0 0;font-size:13px;color:#71717a;">Expect a call or email to confirm details and answer questions</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;vertical-align:top;padding-top:2px;">
                                <div style="background:#e0f2fe;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#0284c7;">3</div>
                              </td>
                              <td style="padding-left:12px;">
                                <p style="margin:0;font-size:14px;font-weight:600;color:#18181b;">Confirmed Pricing & Booking</p>
                                <p style="margin:2px 0 0;font-size:13px;color:#71717a;">We'll confirm exact pricing after a quick property review, then schedule your service</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                      <tr><td style="border-top:1px solid #f4f4f5;"></td></tr>
                    </table>

                    <p style="margin:0 0 4px;font-size:15px;color:#52525b;line-height:1.6;">Have a question in the meantime? Just reply to this email — we're happy to help.</p>
                    <p style="margin:16px 0 0;font-size:15px;color:#18181b;">Talk soon,<br><strong>The ExcelPro Washers Team</strong></p>

                  </td>
                </tr>
              </table>

              <!-- CTA footer -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #f4f4f5;padding:20px 32px;text-align:center;">
                    <a href="${SITE_URL}" style="display:inline-block;background:#0284c7;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">Visit Our Website</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 0;text-align:center;">
              ${this.complianceFooter(params.email, true)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const result = await this.send({
      to: params.email,
      subject: `We received your request — ExcelPro Washers`,
      html,
    });

    return result.success;
  }
}
