# 🕐 Cron Jobs Setup Guide

## Overview

ExcelPro Washers uses Vercel Cron Jobs to execute scheduled follow-ups and maintenance tasks.

## Cron Jobs Configured

### 1. **Follow-ups Executor** (`/api/cron/follow-ups`)
- **Schedule**: Daily at 9:00 AM
- **Purpose**: Sends scheduled follow-up emails to warm and cold leads
- **What it does**:
  - Checks database for pending follow-ups
  - Sends Day 3, 7, 14 follow-ups for warm leads
  - Sends Day 7, 30, 90 follow-ups for cold leads
  - Marks completed follow-ups as done

### 2. **Stale Leads Checker** (`/api/cron/check-stale-leads`)
- **Schedule**: Daily at 6:00 PM
- **Purpose**: Identifies leads older than 30 days with no contact
- **What it does**:
  - Scans all leads in database
  - Finds leads with status "New" older than 30 days
  - Logs stale leads for admin review

## Setup Instructions

### **Step 1: Add Cron Secret to Environment Variables**

In your Vercel project settings, add:

```env
CRON_SECRET=your-super-secret-cron-key-here
```

Generate a secure random string:
```bash
openssl rand -base64 32
```

### **Step 2: Deploy to Vercel**

```bash
git add .
git commit -m "Add cron jobs for automated follow-ups"
git push
```

Vercel will automatically detect `vercel.json` and set up the cron jobs.

### **Step 3: Verify Cron Jobs Are Active**

1. Go to your Vercel project dashboard
2. Click **Settings** → **Cron Jobs**
3. You should see:
   - ✅ `/api/cron/follow-ups` - Daily at 09:00
   - ✅ `/api/cron/check-stale-leads` - Daily at 18:00

## Testing Locally

### **Option 1: Manual Test (Browser)**

Visit: `http://localhost:3000/admin/dashboard/test-cron`

This page lets you manually trigger cron jobs and see results.

### **Option 2: cURL Test**

```bash
# Test follow-ups cron
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/follow-ups

# Test stale leads check
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/check-stale-leads
```

### **Option 3: Vercel CLI Test**

After deploying:

```bash
vercel env pull .env.local
npm run dev

# Then use cURL with your real CRON_SECRET
```

## How It Works

### **Follow-up Flow:**

```
1. Customer submits form
   ↓
2. Lead Qualifier scores as WARM (60)
   ↓
3. Lead Router schedules 4 follow-ups:
   - Day 3: Check-in email
   - Day 7: Special offer
   - Day 14: Final reminder
   ↓
4. WarmLeadSequence.scheduleFollowUp() saves to database:
   {
     id: "followup_lead-123_day3_1738281600000",
     leadId: "lead-123",
     category: "warm",
     type: "follow-up",
     scheduledFor: "2026-02-03T09:00:00.000Z",
     completed: false
   }
   ↓
5. CRON JOB runs daily at 9 AM
   ↓
6. Checks: scheduledFor <= NOW && !completed
   ↓
7. Sends email via Resend
   ↓
8. Marks completed = true
```

## Database Schema

New table added: `scheduledFollowUps`

```typescript
interface ScheduledFollowUp {
  id: string;                    // Unique ID
  leadId: string;                // Reference to request
  category: 'warm' | 'cold';     // Lead temperature
  type: 'follow-up' | 'special-offer' | 'final-check' | ...
  scheduledFor: string;          // ISO date string
  completed: boolean;            // Has it been sent?
  completedAt?: string;          // When was it sent?
  createdAt: string;             // When was it scheduled?
}
```

## Monitoring

### **Check Cron Logs in Vercel:**

1. Go to your project → **Logs**
2. Filter by `/api/cron/`
3. Look for:
   - ✅ `📊 Follow-up execution complete`
   - ⚠️ `No pending follow-ups found`
   - ❌ `Cron job error:`

### **Expected Output:**

```
🕐 Starting daily follow-up check...
  ✅ Executed follow-up followup_lead-123_day3_1738281600
  ✅ Executed follow-up followup_lead-456_day7_1738368000

📊 Follow-up execution complete:
   Processed: 2
   Succeeded: 2
   Failed: 0
```

## Troubleshooting

### **Issue: Cron jobs not running**

**Check:**
1. Vercel dashboard → Cron Jobs → Make sure they're enabled
2. CRON_SECRET is set in environment variables
3. Check logs for errors

### **Issue: Follow-ups not being scheduled**

**Check:**
1. Submit a test lead via contact form
2. Check `.local-db.json` for `scheduledFollowUps` array
3. Verify Lead Router is calling `scheduleFollowUp()`

### **Issue: Emails not sending**

**Check:**
1. RESEND_API_KEY is set correctly
2. Check Resend dashboard for send logs
3. Verify email templates in EmailService.ts

## Future Improvements

- [ ] Add retry logic for failed sends
- [ ] Implement exponential backoff
- [ ] Add Slack/Discord notifications for cron failures
- [ ] Build admin dashboard to view scheduled follow-ups
- [ ] Add ability to cancel/reschedule follow-ups manually
- [ ] Migrate to Vercel KV or Supabase for better querying

## Related Files

- [`vercel.json`](vercel.json) - Cron configuration
- [`app/api/cron/follow-ups/route.ts`](app/api/cron/follow-ups/route.ts) - Follow-ups executor
- [`app/api/cron/check-stale-leads/route.ts`](app/api/cron/check-stale-leads/route.ts) - Stale leads checker
- [`lib/ai/WarmLeadSequence.ts`](lib/ai/WarmLeadSequence.ts) - Warm lead scheduler
- [`lib/ai/ColdLeadSequence.ts`](lib/ai/ColdLeadSequence.ts) - Cold lead scheduler
- [`lib/db.ts`](lib/db.ts) - Database with scheduledFollowUps table
- [`lib/types.ts`](lib/types.ts) - ScheduledFollowUp interface

---

**Status:** ✅ **READY TO DEPLOY**

Deploy to Vercel and your follow-ups will run automatically!
