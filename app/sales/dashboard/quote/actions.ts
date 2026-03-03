'use server'

import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyPortalSession } from '@/lib/session'

export async function createQuote(prevState: any, formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const total = parseFloat(formData.get('total') as string)
  const itemsJson = formData.get('items') as string
  
  // Get Sales Rep ID from signed session
  const cookieStore = await cookies()
  const raw = cookieStore.get('sales_session')?.value
  const session = verifyPortalSession(raw, 'SALES')
  const salesRepId = session?.userId || raw

  // 1. Create Client
  const client = await db.clients.create({
    firstName,
    lastName,
    email,
    phone,
    address
  })

  // 2. Create Quote
  if (client) {
      await db.quotes.create({
        clientId: client.id,
        title: `Estimate for ${address}`,
        items: JSON.parse(itemsJson),
        total: total,
        status: 'Sent',
        salesRepId: salesRepId 
      })
  }

  redirect('/sales/dashboard')
}
