import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()
    console.log('Creating checkout session for invoice:', invoiceId)

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Get invoice
    const invoice = await db.invoices.findById(invoiceId)
    console.log('Invoice found:', invoice ? 'Yes' : 'No')
    if (!invoice) {
      console.log('Invoice not found - returning 404')
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if already paid
    if (invoice.status === 'Paid') {
      console.log('Invoice already paid - returning 400')
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      )
    }

    console.log('Getting client:', invoice.clientId)
    // Get client for description
    const client = await db.clients.findById(invoice.clientId)
    console.log('Client found:', client ? 'Yes' : 'No')
    if (!client) {
      console.log('Client not found - returning 404')
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    console.log('Getting job:', invoice.jobId)
    // Get job for description (if linked)
    const job = invoice.jobId ? await db.jobs.findById(invoice.jobId) : null
    console.log('Job found:', job ? 'Yes' : 'No')

    // Create Stripe checkout session
    const invoiceNum = invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)
    const description = job 
      ? `${job.title} - ExcelPro Washers` 
      : 'Professional Pressure Washing Services - ExcelPro Washers'

    console.log('Creating Stripe session with amount:', invoice.total)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `Invoice #${invoiceNum}`,
              description,
              images: [], // Optional: Add your company logo URL here
            },
            unit_amount: Math.round(invoice.total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/invoice/${invoice.id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/invoice/${invoice.id}?payment=cancelled`,
      metadata: {
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        clientEmail: client.email,
        clientName: `${client.firstName} ${client.lastName}`,
      },
      customer_email: client.email,
    })

    console.log('Session created successfully:', session.id)
    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
