# AI Performance Monitoring - Quick Test

## Test the Notification System

Run this command to test a form submission and see the AI notifications in action:

```bash
npm run dev
```

Then open http://localhost:3000/contact and submit a test lead.

## What You'll See in Terminal

```
🤖 Qualifying lead: John Smith
📊 Lead Score: 85/100 (HOT)
================================================================================
🔔 NEW LEAD SUBMISSION - AI ANALYSIS
================================================================================
👤 Name: John Smith
📧 Email: john@test.com
📞 Phone: (613) 555-1234
🛠️  Service: Window Cleaning
💬 Message: Need cleaning ASAP for property showing tomorrow
--------------------------------------------------------------------------------
🤖 AI SCORE: 85/100
📊 CATEGORY: HOT
💭 REASONING: Urgent language detected ("ASAP"), property showing mentioned,
              clear timeline, ready to book immediately
💰 ESTIMATED VALUE: $450
💵 QUOTE TOTAL: $350
================================================================================
📧 Email notification prepared (configure email service to send)
   To: your-email@gmail.com
   Subject: 🔥 New HOT Lead: John Smith
✅ Lead qualified, quote generated: quote_1234567890
📧 Notifications sent
```

## View in Dashboard

1. Open http://localhost:3000/admin/dashboard/ai-performance
2. See the new lead in "Recent AI Decisions"
3. Click thumbs up or down to rate the AI's accuracy

## Configure Email (Optional)

To receive actual emails instead of just console logs:

1. Add to `.env.local`:
   ```
   NOTIFICATION_EMAIL=your-email@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   ```

2. Install nodemailer:
   ```bash
   npm install nodemailer @types/nodemailer
   ```

3. Restart the server

See **AI_MONITORING_GUIDE.md** for full setup instructions.
