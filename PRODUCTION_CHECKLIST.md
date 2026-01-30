# 🚀 ExcelPro Washers - Production Deployment Checklist

## Pre-Deployment Security

### 1. Environment Variables
- [ ] **CRITICAL**: Change all default PINs in `.local-db.json`
  - Sales Rep PIN: Change from `1234` to strong 6-digit code
  - Contractor PINs: Change from `2001`, `2002`, `2003`
  
- [ ] **CRITICAL**: Update `NEXT_PUBLIC_SITE_URL` to production domain
  ```bash
  # Example: https://excelprowashers.ca
  ```

- [ ] **CRITICAL**: Update `NEXT_PUBLIC_BASE_URL` to match site URL
  
- [ ] **CRITICAL**: Verify all Stripe keys are production keys (not test)
  - `STRIPE_SECRET_KEY` should start with `sk_live_`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` should start with `pk_live_`
  - Set up Stripe webhook and add `STRIPE_WEBHOOK_SECRET`

- [ ] **CRITICAL**: Set strong `CRON_SECRET` (32+ characters)
  ```bash
  # Generate with: openssl rand -base64 32
  ```

- [ ] Verify all API keys are production-ready:
  - `ANTHROPIC_API_KEY` (Claude AI)
  - `RESEND_API_KEY` (Email)
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (SMS)

- [ ] Set contact information:
  - `OWNER_EMAIL`
  - `OWNER_PHONE_NUMBER`

---

## Database Migration

### 2. Move from JSON to Production Database

**Current**: `.local-db.json` file (not suitable for production)  
**Recommended**: Vercel Postgres, Supabase, or PlanetScale

#### Option A: Vercel Postgres (Recommended for Vercel deployment)
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# In Vercel Dashboard:
# 1. Go to Storage tab
# 2. Create new Postgres database
# 3. Copy connection string to environment variables
```

#### Option B: Supabase (Free tier + real-time features)
```bash
# Install Supabase
npm install @supabase/supabase-js

# Setup:
# 1. Create project at https://supabase.com
# 2. Get API keys from project settings
# 3. Run migrations for tables
```

#### Migration Steps:
1. Export current data from `.local-db.json`
2. Create database schema (clients, jobs, quotes, invoices, requests, users, scheduledFollowUps)
3. Import existing data
4. Update `lib/db.ts` to use new database client
5. Test all CRUD operations
6. Set up automated backups

---

## Vercel Deployment

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 4. Configure Vercel Settings

In Vercel Dashboard:

#### Environment Variables
Go to Settings → Environment Variables and add:
- All variables from `.env.local`
- Ensure `CRON_SECRET` is added for cron jobs

#### Cron Jobs
- Automatically configured via `vercel.json`
- Verify cron jobs appear in Deployments → Cron tab
- Schedule:
  - Follow-ups: Daily at 9 AM (`0 9 * * *`)
  - Stale leads check: Daily at 6 PM (`0 18 * * *`)

#### Domains
- Add custom domain
- Configure DNS records
- Enable SSL certificate (automatic)

---

## External Service Configuration

### 5. Stripe Setup

1. **Enable Production Mode**
   - Switch from test to live mode in Stripe Dashboard
   
2. **Configure Webhook**
   - Go to: Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Test Payment Flow**
   - Create test invoice
   - Process payment
   - Verify webhook receives events
   - Check database updated correctly

### 6. Twilio SMS

1. **Verify Phone Numbers**
   - Replace test numbers with real contractor phones in database
   - Verify `TWILIO_PHONE_NUMBER` is approved for SMS
   - Verify `OWNER_PHONE_NUMBER` can receive SMS

2. **Test SMS Notifications**
   - Submit hot lead test
   - Verify owner receives SMS alert
   - Test contractor job notifications

### 7. Resend Email

1. **Verify Domain**
   - Add domain in Resend dashboard
   - Configure DNS records (SPF, DKIM, DMARC)
   - Verify domain ownership

2. **Test Email Delivery**
   - Send test quote email
   - Check spam folder if not received
   - Verify email templates render correctly

### 8. Anthropic Claude AI

1. **Upgrade API Tier** (if needed)
   - Free tier may have rate limits
   - Check usage in Anthropic console

2. **Test Lead Qualification**
   - Submit test contact form
   - Verify AI scoring works
   - Check lead routing automation

---

## Monitoring & Analytics

### 9. Set Up Error Tracking

**Recommended: Sentry**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Configure in `sentry.client.config.js`:
```javascript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
});
```

### 10. Add Analytics

**Option A: Google Analytics**
```bash
# Add to .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Option B: Vercel Analytics**
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
```

---

## Testing

### 11. End-to-End Testing

- [ ] **Contact Form Submission**
  - Submit as hot lead → Verify SMS sent
  - Submit as warm lead → Verify email sequence
  - Submit as cold lead → Verify long-term nurture

- [ ] **Sales Portal**
  - Login with PIN
  - Create quote
  - Send quote email
  - Convert quote to job

- [ ] **Contractor Portal**
  - Login with PIN
  - View available jobs
  - Accept job (race condition test with 2 contractors)
  - Complete job with proof of work

- [ ] **Payment Flow**
  - Generate invoice
  - Customer views invoice
  - Process payment via Stripe
  - Verify webhook updates database
  - Check paid status

- [ ] **Cron Jobs**
  - Wait for scheduled run or manually trigger at `/admin/dashboard/test-cron`
  - Verify follow-ups execute
  - Check logs for errors

- [ ] **Mobile Responsiveness**
  - Test on iPhone, Android
  - Verify forms work
  - Check navigation menu
  - Test payment on mobile

---

## Performance Optimization

### 12. Caching & CDN

- [ ] Enable Vercel Edge Caching for static assets
- [ ] Add Redis/Upstash for rate limiting (replace in-memory)
- [ ] Optimize images (already configured in `next.config.mjs`)
- [ ] Enable Vercel Speed Insights

### 13. Database Indexing

Once migrated from JSON:
- [ ] Add indexes on frequently queried fields:
  - `clients.email`
  - `jobs.status`
  - `invoices.status`
  - `requests.createdAt`
  - `scheduledFollowUps.scheduledFor + completed`

---

## Security Hardening

### 14. Additional Security Measures

- [ ] **Rate Limiting**: Currently in-memory, upgrade to Redis
  ```bash
  npm install @upstash/ratelimit @upstash/redis
  ```

- [ ] **Authentication**: Replace PIN system with proper auth
  - Option A: NextAuth.js
  - Option B: Clerk
  - Option C: Auth0

- [ ] **Data Encryption**: Encrypt sensitive fields in database
  - Client phone numbers
  - Payment information
  - Contractor details

- [ ] **Audit Logging**: Track all critical actions
  - Who created/modified/deleted records
  - Failed login attempts
  - API rate limit violations

- [ ] **HTTPS Only**: Enforce in production
  - Configured via security headers in `next.config.mjs`
  - Verify redirect from HTTP to HTTPS

---

## Backup & Disaster Recovery

### 15. Automated Backups

- [ ] **Database Backups**
  - Daily automated backups
  - 30-day retention
  - Test restore procedure

- [ ] **Environment Variables Backup**
  - Store encrypted copy in password manager
  - Document all API keys and their purpose

- [ ] **Code Repository**
  - Private GitHub repository
  - Protected main branch
  - Required PR reviews for changes

---

## Documentation

### 16. Team Onboarding Docs

- [ ] Create team wiki with:
  - How to access admin portal
  - How to access sales portal
  - How to access contractor portal
  - Emergency contact procedures
  - Common troubleshooting issues

### 17. Customer Support Docs

- [ ] FAQ for customers
- [ ] Payment instructions
- [ ] Service area coverage
- [ ] Refund/dispute policy

---

## Launch Checklist

### 18. Final Pre-Launch Checks

- [ ] All environment variables set in Vercel
- [ ] Custom domain configured and SSL active
- [ ] Email domain verified and sending
- [ ] SMS notifications tested and working
- [ ] Stripe webhook configured and tested
- [ ] Database migrated from JSON to production DB
- [ ] Backups configured and tested
- [ ] Error tracking (Sentry) active
- [ ] Analytics (GA or Vercel) tracking
- [ ] Mobile tested on real devices
- [ ] Load testing completed (100+ concurrent users)
- [ ] Security scan completed (no critical vulnerabilities)

### 19. Post-Launch Monitoring

- [ ] Monitor error rates in Sentry (first 24 hours)
- [ ] Check email delivery rates in Resend
- [ ] Verify cron jobs execute successfully
- [ ] Monitor Stripe payment success rate
- [ ] Review analytics for user behavior
- [ ] Check database performance (query times)

---

## Emergency Contacts

### Support Resources

- **Vercel Support**: https://vercel.com/support
- **Stripe Support**: https://support.stripe.com
- **Twilio Support**: https://www.twilio.com/help
- **Resend Support**: https://resend.com/support
- **Anthropic Support**: support@anthropic.com

### Rollback Procedure

If critical issue detected:
1. Revert to previous deployment in Vercel dashboard
2. Check error logs in Sentry
3. Fix issue locally
4. Test thoroughly
5. Re-deploy with fix

---

## Maintenance Schedule

### Regular Tasks

- **Daily**: Monitor error logs and cron job execution
- **Weekly**: Review lead conversion rates and email open rates
- **Monthly**: Database cleanup (archive old completed jobs)
- **Quarterly**: Security audit and dependency updates

---

## Success Metrics

### Track These KPIs

- Lead conversion rate (contact → quote → job → payment)
- Average response time to hot leads
- Email open rates and click-through rates
- Payment completion rate
- Contractor acceptance rate for jobs
- Customer satisfaction (post-service survey)

---

**Last Updated**: January 30, 2026  
**Next Review**: Before production deployment
