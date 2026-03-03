# 📧 Email Notification Setup - Quick Guide

## ✅ What's Already Done

1. ✅ Nodemailer installed
2. ✅ Email sending code implemented
3. ✅ Twilio SMS already configured (for hot leads)
4. ✅ Template added to `.env.local`

## 🔧 Complete These 3 Steps

### Step 1: Get Gmail App Password (5 minutes)

1. **Go to Google Account Security**:
   - Visit: https://myaccount.google.com/security
   
2. **Enable 2-Step Verification** (if not already enabled):
   - Find "2-Step Verification" section
   - Click "Get Started" and follow the prompts

3. **Create App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Or search "App passwords" in your Google Account settings
   - Select "Mail" for the app type
   - Select "Other (Custom name)" for the device
   - Enter name: **ExcelPro CRM**
   - Click "Generate"
   - **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 2: Update `.env.local` (2 minutes)

Open `.env.local` and replace these 4 values:

```env
NOTIFICATION_EMAIL=your-actual-email@gmail.com
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=abcdefghijklmnop
```

**Important**: 
- Use the same Gmail address for both `NOTIFICATION_EMAIL` and `SMTP_USER`
- For `SMTP_PASS`, paste the 16-character app password (remove spaces)
- Example: If Google shows `abcd efgh ijkl mnop`, use `abcdefghijklmnop`

### Step 3: Test It! (1 minute)

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your contact form**:
   - Go to: http://localhost:3000/contact

3. **Submit a test lead**:
   - Fill in the form
   - Use urgent language like "Need ASAP" to trigger a HOT lead
   - Submit

4. **Check your results**:
   - ✅ Terminal should show: "✅ Email notification sent successfully!"
   - ✅ Check your Gmail inbox (email should arrive within seconds)
   - ✅ If it's a hot lead (80+), you'll also get an SMS at: +1 (343) 574-0300

## 📱 What You'll Receive

### Email Notification (All Leads)
- Beautiful HTML email with color-coded priority
- Lead's contact information
- AI score and category
- Full AI reasoning
- Estimated value and quote amount
- Direct link to dashboard

### SMS Notification (Hot Leads Only - 80+ Score)
```
🔥 HOT LEAD ALERT!

John Smith
(613) 555-1234
Score: 92/100
Value: $850

CALL NOW!
```

## 🔍 Troubleshooting

### "Email notification sent" but no email received?

1. **Check spam folder** - First email might go there
2. **Verify Gmail settings**:
   - Make sure you used an App Password, not your regular password
   - App Password should be 16 characters (no spaces)
   - Both NOTIFICATION_EMAIL and SMTP_USER should be the same Gmail address

3. **Check terminal for errors**:
   - Look for "Failed to send email notification" messages
   - Common error: "Invalid login" = wrong app password

### "Authentication failed" error?

- You're using your regular Gmail password instead of App Password
- Go back to Step 1 and create an App Password

### Still not working?

Check the terminal output - it will show exactly what's happening:
```
📧 Sending email notification...
   To: your-email@gmail.com
   Subject: 🔥 New HOT Lead: John Smith
✅ Email notification sent successfully!
```

## 🎯 Alternative: Use Resend (Already Configured!)

I noticed you already have **Resend API** configured in your `.env.local`:

```env
RESEND_API_KEY=re_your_resend_api_key
```

If you prefer to use Resend instead of Gmail (it's more reliable for transactional emails), let me know and I'll switch the email service!

**Resend Benefits**:
- No 2FA or App Password needed
- Better deliverability
- Email analytics
- Already in your project!

## ✅ Quick Checklist

- [ ] Created Gmail App Password
- [ ] Updated NOTIFICATION_EMAIL in `.env.local`
- [ ] Updated SMTP_USER in `.env.local`
- [ ] Updated SMTP_PASS in `.env.local`
- [ ] Started server: `npm run dev`
- [ ] Submitted test form
- [ ] Received email notification
- [ ] (If hot lead) Received SMS notification

## 🚀 Next Steps

Once email is working:
1. Open the AI Performance Dashboard: http://localhost:3000/admin/dashboard/ai-performance
2. Rate AI decisions with 👍 👎
3. Export data to CSV for analysis
4. Adjust follow-up sequences based on conversion rates

You'll now be shadowing every AI decision in real-time! 🎉
