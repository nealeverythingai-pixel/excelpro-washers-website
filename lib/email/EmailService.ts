/**
 * Email Service using Resend
 * Handles all email sending operations
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  // Use Resend's onboarding domain for testing, or your verified domain
  private static readonly DEFAULT_FROM = 'ExcelPro Washers <onboarding@resend.dev>';

  /**
   * Send an email using Resend
   */
  static async send(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.log('⚠️  RESEND_API_KEY not configured - email simulation mode');
        console.log('📧 Would send email:', {
          to: options.to,
          subject: options.subject,
          preview: options.html.substring(0, 200)
        });
        return { success: true, messageId: 'simulated-' + Date.now() };
      }

      const { data, error } = await resend.emails.send({
        from: options.from || this.DEFAULT_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
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
    const minPrice = Math.round(params.estimatedValue * 0.9);
    const maxPrice = Math.round(params.estimatedValue * 1.1);
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
        <div style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">ESTIMATED PRICE</div>
        <div class="price">$${minPrice} - $${maxPrice}</div>
        <div style="color: #6b7280; font-size: 14px; margin-top: 10px;">Final price confirmed after property inspection</div>
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
    </div>
  </div>
</body>
</html>
    `;

    const result = await this.send({
      to: params.email,
      subject: `Your ExcelPro Washers Quote - $${minPrice}-$${maxPrice}`,
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
            <td style="text-align: right;"><strong>$150</strong></td>
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
}
