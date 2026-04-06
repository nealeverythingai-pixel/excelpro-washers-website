'use server'

import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyPortalSession } from '@/lib/session'
import { LeadRouter } from '@/lib/ai/LeadRouter'
import { updateKnockStatus } from '../canvassing/actions'
import { createClient } from '@supabase/supabase-js'

// Lazy getter — avoids module-level env var access during Next.js build
const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createQuote(prevState: any, formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const total = parseFloat(formData.get('total') as string)
  const itemsJson = formData.get('items') as string
  const tier = formData.get('tier') as string || 'mid'
  const contractorPay = parseFloat(formData.get('contractorPay') as string) || 0
  const repCommission = parseFloat(formData.get('repCommission') as string) || 0
  const leadSource = (formData.get('leadSource') as string) || 'given'
  const houseAreaSqft = parseInt(formData.get('houseAreaSqft') as string) || 0
  const windowFactor = parseFloat(formData.get('windowFactor') as string) || 1
  const sizeMultiplier = parseFloat(formData.get('sizeMultiplier') as string) || 1
  const storyMultiplier = parseFloat(formData.get('storyMultiplier') as string) || 1
  const knockId = formData.get('knockId') as string | null // set when coming from canvassing

  // Get Sales Rep info from signed session
  const cookieStore = await cookies()
  const raw = cookieStore.get('sales_session')?.value
  const session = verifyPortalSession(raw, 'SALES')
  const salesRepId = session?.userId || raw
  const salesRepUser = salesRepId ? await db.users.findById(salesRepId) : null
  const salesRepName = salesRepUser?.name || 'Sales Rep'

  const itemsParsed = JSON.parse(itemsJson)
  const serviceNames = itemsParsed.map((i: { description: string }) => i.description).join(', ')

  // 1. Create Client
  const client = await db.clients.create({ firstName, lastName, email, phone, address })

  // 2. Create Quote
  if (client) {
    await db.quotes.create({
      clientId: client.id,
      title: `${tier.charAt(0).toUpperCase() + tier.slice(1)} — ${address}`,
      items: itemsParsed,
      total,
      status: 'Sent',
      salesRepId,
      notes: JSON.stringify({
        tier, contractorPay, repCommission, leadSource,
        houseAreaSqft, windowFactor, sizeMultiplier, storyMultiplier,
        knockId: knockId || null,
        source: knockId ? 'door-to-door' : leadSource,
      }),
    })
  }

  // 3. Insert into CRM requests table (triggers full automated workflow)
  const requestId = `req_${Date.now()}`
  try {
    await db.requests.create({
      id: requestId,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      phone,
      address,
      service: serviceNames,
      message: `Quote created by sales rep ${salesRepName} in person. Services: ${serviceNames}. Total: $${total}.${knockId ? ' Source: door-to-door canvassing.' : ''}`,
      status: 'New',
      aiScore: 95, // in-person = highest intent
      aiCategory: 'hot',
      aiReasoning: `In-person sale by rep ${salesRepName}. Quote presented and accepted on the doorstep.`,
      estimatedValue: total,
    })
  } catch (e) {
    console.error('CRM insert failed:', e)
  }

  // 4. Trigger LeadRouter — Telegram alert + follow-up scheduling
  try {
    await LeadRouter.routeLead({
      id: requestId,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      service: serviceNames,
      details: `In-person quote by ${salesRepName}. Total: $${total}.`,
      message: `In-person quote by ${salesRepName}. Total: $${total}.`,
      score: 95,
      category: 'hot',
      estimatedValue: total,
      reasoning: `In-person sale by rep ${salesRepName} — door-to-door canvassing.`,
      quoteTotal: total,
      address,
    })
  } catch (e) {
    console.error('LeadRouter failed:', e)
  }

  // 5. If came from canvassing, mark that door knock as sold
  if (knockId) {
    try {
      await updateKnockStatus(knockId, 'sold', `Quote created — $${total}`)
    } catch (e) {
      console.error('Knock status update failed:', e)
    }
  }

  redirect('/sales/dashboard')
}
