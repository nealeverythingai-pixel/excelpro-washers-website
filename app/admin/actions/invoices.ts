'use server'

import { db } from '../../../lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createInvoice(formData: FormData) {
  const clientId = formData.get('clientId') as string
  const total = parseFloat(formData.get('total') as string) || 0
  const dueDate = formData.get('dueDate') as string

  await db.invoices.create({
    clientId,
    total,
    dueDate,
    status: 'Draft'
  })

  revalidatePath('/admin/dashboard/invoices')
  redirect('/admin/dashboard/invoices')
}
