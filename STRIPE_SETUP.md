# Stripe Integration Setup Guide

## Overview
Stripe payment integration allows customers to pay invoices online with credit/debit cards. The system automatically updates invoice status when payment is confirmed.

## Setup Steps

### 1. Get Your Stripe API Keys

1. Sign up at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. After signing in, go to **Developers > API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...` for test mode)
   - ⚠️ Keep your secret key secure - never commit it to git or share publicly

### 2. Update Environment Variables

Open `.env.local` and replace the placeholder keys:

```env
# Replace these with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Test in Development

1. Use Stripe's test mode keys (start with `pk_test_` and `sk_test_`)
2. Test with these card numbers:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002
   - Use any future expiry date and any 3-digit CVC
3. Test payments won't charge real money

### 4. Set Up Webhooks (Important!)

Webhooks automatically update invoice status when payment succeeds:

#### For Local Development:
1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Forward events: `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret (starts with `whsec_...`)
5. Update `STRIPE_WEBHOOK_SECRET` in `.env.local`

#### For Production:
1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the signing secret and update `.env.local` on your production server

### 5. Go Live (When Ready)

1. Complete Stripe account activation (provide business details)
2. Switch to **Live mode** in Stripe Dashboard
3. Get your **live** API keys (start with `pk_live_` and `sk_live_`)
4. Update `.env.local` with live keys
5. Set up production webhooks (see above)
6. Test with small real payment before going fully live

## How It Works

### Payment Flow:
1. Customer views invoice at `/invoice/{id}`
2. Clicks **"Pay Now with Card"** button (only shows for unpaid invoices)
3. Redirects to Stripe Checkout (secure Stripe-hosted page)
4. Customer enters card details and completes payment
5. Stripe processes payment securely
6. Customer redirects back to invoice page
7. Webhook automatically updates invoice status to "Paid"

### Security Features:
- ✅ No card details touch your server
- ✅ PCI compliance handled by Stripe
- ✅ Webhook signature verification prevents fraud
- ✅ Client email pre-filled in checkout
- ✅ Invoice metadata included in payment

## Features

### Customer Experience:
- **Secure payments** via Stripe Checkout
- **Multiple payment methods** (credit/debit cards)
- **Mobile-optimized** checkout flow
- **Automatic receipts** from Stripe
- **Success/cancel redirects** back to invoice page

### Admin Benefits:
- **Auto-updates** invoice status to Paid
- **Payment tracking** in Stripe Dashboard
- **Refund capability** through Stripe
- **Detailed payment logs**
- **Dispute management** via Stripe

## Testing

### Test the Integration:

1. Start dev server: `npm run dev`
2. Go to admin dashboard: `http://localhost:3000/admin/dashboard`
3. View an unpaid invoice in the invoices tab
4. Click "View Customer Invoice" or copy the public invoice URL
5. Click **"Pay Now with Card"**
6. Use test card: `4242 4242 4242 4242`
7. Complete payment
8. Verify invoice status updates to "Paid"

### Monitor Webhook Activity:

If using Stripe CLI:
```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

You'll see webhook events in real-time:
```
✔ Ready! You're now listening for webhook events
✔ Received event: checkout.session.completed
✔ Received event: payment_intent.succeeded
```

## Pricing

### Stripe Fees:
- **Canada**: 2.9% + $0.30 per successful transaction
- **US**: 2.9% + $0.30 per successful transaction
- **International**: 3.9% + $0.30 per transaction
- No monthly fees, no setup fees
- Only pay when you get paid

### Example:
- Invoice: $500
- Stripe fee: $14.80 (2.9% + $0.30)
- You receive: $485.20

## Troubleshooting

### Issue: "Pay Now" button doesn't work
- Check browser console for errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Ensure key starts with `pk_test_` or `pk_live_`

### Issue: Payment succeeds but invoice not updated
- Check webhook secret is correct
- Verify webhook endpoint is accessible
- Check server logs for webhook errors
- Ensure Stripe CLI is running (for local dev)

### Issue: Invalid API key error
- Verify `.env.local` has correct keys
- Restart dev server after changing env vars
- Check for extra spaces in key values

## Support

- **Stripe Docs**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: [https://support.stripe.com/](https://support.stripe.com/)
- **Stripe Status**: [https://status.stripe.com/](https://status.stripe.com/)

## Production Checklist

Before going live:
- [ ] Complete Stripe account activation
- [ ] Switch to live API keys
- [ ] Set up production webhooks
- [ ] Test with small real payment
- [ ] Enable Stripe Radar (fraud prevention)
- [ ] Set up email notifications for payments
- [ ] Configure refund policy
- [ ] Review Stripe Dashboard settings
- [ ] Test customer payment flow end-to-end
- [ ] Document payment policies for customers
