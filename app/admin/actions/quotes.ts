'use server'

import { db } from '../../../lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createQuote(formData: FormData) {
  const clientId = formData.get('clientId') as string
  const title = formData.get('title') as string
  const total = parseFloat(formData.get('total') as string) || 0

  await db.quotes.create({
    clientId,
    title,
    items: [], // Simplified for now
    total,
    status: 'Draft'
  })

  revalidatePath('/admin/dashboard/quotes')
  redirect('/admin/dashboard/quotes')
}

export async function deleteQuote(id: string) {
  await db.quotes.delete(id)
  revalidatePath('/admin/dashboard/quotes')
}
