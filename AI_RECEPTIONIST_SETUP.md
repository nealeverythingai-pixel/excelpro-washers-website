# AI Phone Receptionist Setup Guide

## Overview
Your website now has an AI-powered phone receptionist that can answer calls 24/7, answer questions about your services, and help schedule appointments using natural conversation.

## Features
- ✅ Answers calls automatically
- ✅ Natural conversation using Claude AI
- ✅ Answers questions about services and pricing
- ✅ Helps schedule appointments
- ✅ Professional and friendly tone
- ✅ Logs all calls in your admin dashboard

## Setup Instructions

### Step 1: Get Twilio Account (Phone Service)

1. Go to [Twilio.com](https://www.twilio.com/try-twilio)
2. Sign up for a free account (includes $15 credit)
3. **Get your credentials:**
   - Account SID: Dashboard → Account Info → Account SID
   - Auth Token: Dashboard → Account Info → Auth Token (click to reveal)
4. **Buy a phone number:**
   - Go to Phone Numbers → Buy a Number
   - Choose a number with Voice capabilities
   - Cost: ~$1/month + $0.0085/minute for calls

### Step 2: Configure Twilio Webhooks

1. Go to Phone Numbers → Manage → Active numbers
2. Click on your new phone number
3. **Configure Voice & Fax section:**
   
   **When a call comes in:**
   - Configure with: Webhooks/TwiML
   - A CALL COMES IN: `https://your-domain.com/api/voice/incoming`
   - HTTP: POST

   **Call Status Changes:**
   - Status Callback URL: `https://your-domain.com/api/voice/status`
   - HTTP: POST
   
4. Click **Save**

### Step 3: Get ElevenLabs API Key (Optional - Better Voice)

**Note:** Currently using Twilio's built-in voice. For premium AI voice:

1. Go to [ElevenLabs.io](https://elevenlabs.io/)
2. Sign up for free account (10,000 characters/month free)
3. Go to Profile → API Keys
4. Create new API key
5. **Choose a voice:**
   - Go to Voice Library
   - Pick a voice and copy its Voice ID
   - Default: Rachel (21m00Tcm4TlvDq8ikWAM)

### Step 4: Add Environment Variables

Add to your `.env.local` file:

```env
# Twilio (Required)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# ElevenLabs (Optional - for better voice quality)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Already have these
ANTHROPIC_API_KEY=your_existing_key
NEXT_PUBLIC_SITE_URL=https://excelprowashers.com
```

### Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Add AI phone receptionist"
git push
```

Vercel will automatically deploy with the new endpoints.

### Step 6: Update Twilio Webhooks with Live URL

After deployment:
1. Replace `your-domain.com` in Twilio webhooks with `excelprowashers.com`
2. URLs should be:
   - Incoming: `https://excelprowashers.com/api/voice/incoming`
   - Status: `https://excelprowashers.com/api/voice/status`

## Testing

### Test the AI Receptionist

1. Call your Twilio phone number
2. The AI will answer: "Hello! Thank you for calling ExcelPro Washers..."
3. Speak naturally and ask questions like:
   - "What services do you offer?"
   - "How much does window cleaning cost?"
   - "Can I schedule an appointment?"
   - "What are your hours?"

### View Call Logs

All calls are logged in your database. You can access them through the admin dashboard.

## Customization

### Modify the Receptionist's Personality

Edit `app/api/voice/respond/route.ts` and change the `RECEPTIONIST_PROMPT`:

```typescript
const RECEPTIONIST_PROMPT = `You are a friendly receptionist...
[Customize this text to change how the AI responds]
`;
```

### Update Business Information

Current info in the prompt:
- Services: Window cleaning, pressure washing, gutter cleaning
- Pricing: Residential from $150
- Hours: Mon-Sat, 8 AM - 6 PM
- Area: Greater Seattle

Edit the prompt to update these details.

## Pricing Estimates

### Twilio Costs
- Phone number: $1/month
- Incoming calls: $0.0085/minute
- Example: 100 calls/month × 3 min avg = $2.55/month
- **Total: ~$3.50/month**

### ElevenLabs (Optional)
- Free: 10,000 characters/month
- Starter: $5/month for 30,000 characters
- **Recommended: Start with free tier**

### Claude AI (Already Using)
- Included in your existing Anthropic usage
- ~$0.003 per call conversation

## Troubleshooting

### Calls not being answered
1. Check Twilio webhook URLs are correct
2. Verify environment variables are set in Vercel
3. Check Vercel deployment logs

### AI responses are slow
- This is normal for the first call (cold start)
- Subsequent calls respond faster

### Voice quality issues
- Consider upgrading to ElevenLabs for premium voice
- Adjust speaking rate in TwiML settings

## Support

For issues:
1. Check Twilio debugger for call logs
2. Check Vercel logs for API errors
3. Test endpoints directly: `https://excelprowashers.com/api/voice/incoming`

## Next Steps

Consider adding:
- [ ] Call transcription storage
- [ ] Automatic appointment booking
- [ ] SMS follow-ups after calls
- [ ] Call analytics dashboard
- [ ] Multiple language support
