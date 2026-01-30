import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get invoice ID from metadata
        const invoiceId = session.metadata?.invoiceId

        if (!invoiceId) {
          console.error('No invoice ID in session metadata')
          break
        }

        // Get invoice
        const invoice = db.invoices.findById(invoiceId)
        if (!invoice) {
          console.error('Invoice not found:', invoiceId)
          break
        }

        // Update invoice status to Paid
        try {
          db.invoices.update(invoiceId, {
            ...invoice,
            status: 'Paid',
          })

          console.log('✅ Invoice marked as paid:', invoiceId)
          console.log('   Payment ID:', session.payment_intent)
          console.log('   Amount:', session.amount_total ? session.amount_total / 100 : 0, 'CAD')
          console.log('   Customer:', session.customer_email)

          // TODO: Send payment confirmation email to customer
          // TODO: Send payment notification to admin

        } catch (updateError) {
          console.error('Failed to update invoice:', updateError)
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('✅ Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('❌ Payment failed:', paymentIntent.id)
        // TODO: Notify admin of failed payment
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
