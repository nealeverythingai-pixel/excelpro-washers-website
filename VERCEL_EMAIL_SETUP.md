# 📧 Vercel Email Notifications - Setup (1 Minute!)

## ✅ Perfect! You're Already 90% Setup

Your `.env.local` already has:
```env
RESEND_API_KEY=re_your_resend_api_key
```

**Resend is Vercel's recommended email service** - they work seamlessly together!

---

## 🚀 Complete Setup (Just 1 Step!)

### Update `.env.local`

Open `.env.local` and replace this line:
```env
NOTIFICATION_EMAIL=your-email@gmail.com
```

With your actual Gmail address:
```env
NOTIFICATION_EMAIL=youremail@gmail.com
```

**That's it!** No SMTP, no App Password, no complicated setup. 🎉

---

## 🧪 Test It Now

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Submit a test form**:
   - Go to: http://localhost:3000/contact
   - Fill it out (use "Need ASAP" for a hot lead)
   - Submit

3. **Check your terminal**:
   ```
   📧 Sending email via Resend...
      To: youremail@gmail.com
   ✅ Email notification sent successfully via Resend!
   ```

4. **Check your Gmail inbox** - Email should arrive within seconds!

---

## 📱 What You'll Receive

### Email (All Leads)
Beautiful HTML email with:
- Lead's contact info
- AI score and category (🔥/🌡️/❄️)
- Full AI reasoning
- Estimated value
- Direct link to dashboard

### SMS (Hot Leads Only - Already Working!)
Text message to: **+1 (343) 574-0300**
```
🔥 HOT LEAD ALERT!
John Smith
(613) 555-1234
Score: 92/100
Value: $850
CALL NOW!
```

---

## 🌐 Deploying to Vercel

When you deploy to Vercel, you need to add the environment variables there too:

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add these variables**:
   ```
   NOTIFICATION_EMAIL=youremail@gmail.com
   RESEND_API_KEY=re_your_resend_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   OWNER_PHONE_NUMBER=+1XXXXXXXXXX
   ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

5. **Redeploy** - That's it!

---

## 🎯 Why Resend is Perfect for Vercel

✅ **No SMTP configuration** - Just API key
✅ **Better deliverability** - Won't go to spam
✅ **Email analytics** - See open rates, clicks
✅ **100 emails/day free** - Perfect for getting started
✅ **Built for transactional emails** - Lead notifications, confirmations, etc.
✅ **Vercel recommended** - Seamless integration

---

## 🔍 Troubleshooting

### "Email not received"?

1. **Check spam folder** first
2. **Verify your email** in `.env.local` is correct
3. **Check terminal** for success message
4. **Check Resend dashboard**: https://resend.com/emails

### "From address" looks weird?

The email will come from: `onboarding@resend.dev`

**To use your own domain:**
1. Go to: https://resend.com/domains
2. Add your domain (e.g., `excelprowashers.com`)
3. Add DNS records
4. Update the code to use: `noreply@excelprowashers.com`

---

## ✅ Quick Checklist

- [x] Resend API key already configured ✅
- [x] Resend package already installed ✅
- [x] Notification code switched to Resend ✅
- [ ] Update NOTIFICATION_EMAIL in `.env.local`
- [ ] Test with `npm run dev`
- [ ] Submit test form
- [ ] Receive email
- [ ] Deploy to Vercel (add env vars there too)

---

## 🎉 You're Done!

Just update that one line (`NOTIFICATION_EMAIL`) and you'll start receiving beautiful email notifications for every lead!

Much simpler than Gmail SMTP, and works perfectly on Vercel! 🚀
