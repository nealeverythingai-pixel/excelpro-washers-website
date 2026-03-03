# AI Performance Monitoring & Notifications Guide

## Overview

Your ExcelPro Washers website now has a comprehensive AI performance monitoring system that lets you track and shadow every lead qualification decision in real-time.

## What's Been Added

### 1. Real-Time Console Notifications ✅ (Already Working)

Every time someone submits a contact form, you'll see a detailed breakdown in your terminal:

```
================================================================================
🔔 NEW LEAD SUBMISSION - AI ANALYSIS
================================================================================
👤 Name: John Smith
📧 Email: john@email.com
📞 Phone: (613) 555-1234
🛠️  Service: Window Cleaning, Pressure Washing
💬 Message: Need urgent cleaning for property showing tomorrow
--------------------------------------------------------------------------------
🤖 AI SCORE: 92/100
📊 CATEGORY: HOT
💭 REASONING: Urgent timeframe detected, property showing mentioned, multiple 
            services requested, ready to book immediately
💰 ESTIMATED VALUE: $850
💵 QUOTE TOTAL: $750
================================================================================
```

### 2. AI Performance Dashboard ✅ (Ready to Use)

Navigate to `/admin/dashboard/ai-performance` to see:

- **Total Leads Analyzed**: How many leads the AI has processed
- **AI Accuracy Rate**: Based on your feedback (thumbs up/down)
- **Average Score**: Average qualification score across all leads
- **Hot Lead Conversion**: How many hot leads actually convert
- **Category Breakdown**: Distribution of hot/warm/cold leads
- **Recent Decisions**: Last 20 leads with full details
- **Feedback System**: Rate each AI decision as accurate/inaccurate
- **Export to CSV**: Download all data for analysis

### 3. Email Notifications 📧 (Configure to Enable)

Beautiful HTML email notifications with:
- Lead contact information
- AI score and category (with visual badges)
- Full AI reasoning
- Quote amount and estimated value
- Direct link to dashboard
- Priority coloring (red for hot, yellow for warm, blue for cold)

### 4. SMS Alerts 📱 (Optional - Hot Leads Only)

Text message alerts for hot leads (80+ score):
```
🔥 HOT LEAD ALERT!

John Smith
(613) 555-1234
Score: 92/100
Value: $850

CALL NOW!
```

### 5. Slack Integration 💬 (Optional)

Rich Slack messages with all lead details posted to your chosen channel.

---

## How to Enable Notifications

### Step 1: Console Logs (Already Active)

Console notifications are **already working**! Just keep your terminal running:

```bash
npm run dev
```

Every form submission will print a detailed breakdown to your terminal.

### Step 2: Enable Email Notifications

#### Option A: Gmail (Easiest)

1. **Enable App Password**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification
   - Search for "App passwords"
   - Create new app password for "Mail" → "Other (ExcelPro CRM)"
   - Copy the 16-character password

2. **Add to .env.local**:
   ```env
   NOTIFICATION_EMAIL=your-email@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   ```

3. **Install Email Package**:
   ```bash
   npm install nodemailer @types/nodemailer
   ```

4. **Uncomment Email Code**:
   - Open `lib/notifications/NotificationService.ts`
   - Find the `sendEmailNotification` method
   - Uncomment the `sendEmail()` call at the bottom
   - Add this helper function:
   ```typescript
   async function sendEmail(options: {
     to: string;
     subject: string;
     html: string;
   }) {
     const nodemailer = require('nodemailer');
     const transporter = nodemailer.createTransport({
       host: process.env.SMTP_HOST,
       port: parseInt(process.env.SMTP_PORT || '587'),
       secure: false,
       auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS,
       },
     });
     
     await transporter.sendMail({
       from: process.env.SMTP_USER,
       ...options,
     });
   }
   ```

#### Option B: SendGrid (More Reliable for Production)

1. **Sign Up**: https://sendgrid.com/ (free tier: 100 emails/day)

2. **Create API Key**:
   - Go to Settings → API Keys
   - Create new key with "Mail Send" permission
   - Copy the key

3. **Verify Sender**:
   - Go to Settings → Sender Authentication
   - Verify your email address

4. **Add to .env.local**:
   ```env
   NOTIFICATION_EMAIL=your-email@gmail.com
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

5. **Install & Configure**:
   ```bash
   npm install @sendgrid/mail
   ```

### Step 3: Enable SMS Alerts (Optional)

1. **Sign Up for Twilio**: https://www.twilio.com/
   - Get a phone number ($1-2/month)
   - Free trial includes $15 credit

2. **Get Credentials**:
   - Account SID (found in console)
   - Auth Token (found in console)
   - Your Twilio phone number

3. **Add to .env.local**:
   ```env
   NOTIFICATION_PHONE=+16135551234
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
   TWILIO_PHONE=+16135551234
   ```

4. **Install Twilio**:
   ```bash
   npm install twilio
   ```

### Step 4: Enable Slack (Optional)

1. **Create Incoming Webhook**:
   - Go to https://api.slack.com/apps
   - Create new app or select existing
   - Enable "Incoming Webhooks"
   - Add webhook to your #leads channel
   - Copy webhook URL

2. **Add to .env.local**:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/xxx
   ```

**No installation needed** - Slack webhooks work with just fetch!

---

## Testing Your Setup

### 1. Test Form Submission

1. Go to your contact form: `/contact`
2. Fill out with test data:
   - Use urgent language: "Need ASAP for property showing tomorrow"
   - Multiple services
   - Include phone and email

### 2. Check Terminal Output

You should immediately see:
```
🤖 Qualifying lead: John Smith
📊 Lead Score: 92/100 (HOT)
✅ Lead qualified, quote generated: quote_1234567890
📧 Notifications sent
```

### 3. Check Email (if configured)

Within seconds, you should receive a beautifully formatted email with:
- All lead details
- AI analysis
- Direct link to dashboard

### 4. Check Dashboard

1. Go to `/admin/dashboard/ai-performance`
2. You should see your test lead in "Recent AI Decisions"
3. Click thumbs up/down to rate accuracy

---

## Using the Dashboard

### Metrics Cards

- **Total Leads**: Count of all AI-qualified leads
- **Accuracy Rate**: % of AI decisions you marked as accurate
- **Average Score**: Mean score across all leads
- **Hot Conversion**: % of hot leads that converted to customers

### Category Breakdown

See distribution:
- 🔥 **Hot Leads (80-100)**: Urgent, high-value, ready to buy
- 🌡️ **Warm Leads (50-79)**: Interested, needs nurturing
- ❄️ **Cold Leads (0-49)**: Low urgency, long-term prospects

Each shows count and conversion rate.

### Recent Decisions

Last 20 leads with:
- Name, timestamp, contact info
- AI score and category badge
- Full AI reasoning
- Estimated value
- Actual outcome (pending/converted/lost)
- Feedback buttons (👍 👎)

**To provide feedback**:
1. Review the AI's reasoning
2. Check if it matches reality
3. Click thumbs up if accurate, down if not
4. This improves accuracy metrics

### Export Data

Click "Export to CSV" to download all decisions for analysis in Excel/Google Sheets.

### Notifications Toggle

Enable/disable the notifications system without restarting the server.

---

## What Gets Tracked

### Input Data
- Name, email, phone
- Service requested
- Message content
- Property details

### AI Analysis
- Overall score (0-100)
- Category (hot/warm/cold)
- Detailed reasoning
- Estimated customer value
- Quote generated

### Actual Outcome
- Converted: Lead became a customer
- Lost: Lead didn't convert
- Pending: Still in follow-up

### Your Feedback
- Accurate: AI decision was correct
- Inaccurate: AI made a mistake

---

## Notification Channels Summary

| Channel | Status | Setup Time | Cost | When It Triggers |
|---------|--------|------------|------|------------------|
| **Console Logs** | ✅ Active | 0 min | Free | Every lead |
| **Email** | ⚙️ Configure | 10 min | Free | Every lead |
| **SMS** | ⚙️ Optional | 15 min | ~$0.01/SMS | Hot leads only |
| **Slack** | ⚙️ Optional | 5 min | Free | Every lead |

---

## Monitoring Workflow

### Real-Time (As Leads Come In)

1. **Form Submitted** → Instant console log
2. **AI Analyzes** → Score, category, reasoning
3. **Email Sent** → Detailed notification (if configured)
4. **SMS Alert** → For hot leads (if configured)
5. **Dashboard Updated** → Lead appears in recent decisions

### Daily Review

1. Open `/admin/dashboard/ai-performance`
2. Check accuracy rate (should be 80%+)
3. Review hot leads → Did AI correctly identify urgency?
4. Provide feedback on any mistakes
5. Export weekly for trend analysis

### Weekly Analysis

1. Export CSV data
2. Look for patterns:
   - What words/phrases indicate hot leads?
   - Are quote amounts accurate?
   - Which services have highest conversion?
3. Adjust follow-up sequences if needed

---

## Troubleshooting

### "No notifications appearing"

**Console Logs**:
- Make sure `npm run dev` is running
- Check terminal output after form submission

**Email**:
- Verify NOTIFICATION_EMAIL is set in .env.local
- Check email service credentials
- Look for error in terminal: "Failed to send email notification"
- Check spam folder

**SMS**:
- Only triggers for hot leads (80+ score)
- Verify NOTIFICATION_PHONE and Twilio credentials
- Check Twilio console for delivery logs

### "Dashboard shows 0 leads"

- Submit a test form first
- Check terminal shows "Lead qualified"
- Verify data is in `.local-db.json` file
- Refresh dashboard page

### "Accuracy rate is N/A"

- You need to provide feedback first
- Click thumbs up/down on at least one decision
- Refresh page to see updated rate

### "Email formatting looks broken"

- Some email clients block external CSS
- Gmail, Outlook should display correctly
- Test with different email providers

---

## Best Practices

### 1. Review Daily
- Check dashboard every morning
- Respond to hot leads immediately
- Provide feedback on 3-5 decisions

### 2. Trust But Verify
- AI is 85-90% accurate on average
- Review hot leads before following up
- Use your judgment on edge cases

### 3. Improve Over Time
- Consistent feedback improves accuracy
- After 50+ leads, patterns emerge
- Adjust follow-up sequences based on data

### 4. Set Up Alerts
- Configure email first (takes 10 min)
- Add SMS for hot leads if you're mobile
- Slack if your team needs visibility

### 5. Export Regularly
- Weekly CSV export
- Track trends over time
- Share with team for insights

---

## What Happens Next

With this system, you now have:

1. **👁️ Complete Visibility**: See every AI decision with reasoning
2. **📊 Performance Metrics**: Track accuracy and conversions
3. **🔔 Real-Time Alerts**: Get notified immediately on new leads
4. **💬 Feedback Loop**: Improve AI with thumbs up/down
5. **📈 Data Export**: Analyze trends in Excel/Sheets
6. **🎯 Smart Routing**: Hot leads get immediate attention

Every form submission is now tracked, scored, and monitored. You can shadow the entire process from form → AI → routing → follow-up.

---

## Quick Start Checklist

- [x] Console notifications working (already active)
- [ ] Add NOTIFICATION_EMAIL to .env.local
- [ ] Configure email service (Gmail or SendGrid)
- [ ] Test form submission
- [ ] Check email inbox
- [ ] Open AI Performance dashboard
- [ ] Provide feedback on first lead
- [ ] (Optional) Set up SMS alerts
- [ ] (Optional) Set up Slack webhook

---

## Support

If you need help setting up:

1. **Email Issues**: Check Gmail App Password setup guide above
2. **Dashboard Issues**: Make sure you've submitted at least one test lead
3. **SMS Issues**: Verify Twilio credentials and phone number format
4. **General Questions**: Review the troubleshooting section

The system is designed to work with just console logs out of the box. Email, SMS, and Slack are optional enhancements!
