'use server'

import { db } from '../../../lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClient(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const companyName = formData.get('companyName') as string

  if (!firstName || !lastName || !email) {
    return { error: 'Please fill in all required fields' }
  }

  await db.clients.create({
    firstName,
    lastName,
    email,
    phone,
    address,
    companyName
  })

  revalidatePath('/admin/dashboard/clients')
  redirect('/admin/dashboard/clients')
}

export async function deleteClient(id: string) {
    await db.clients.delete(id)
    revalidatePath('/admin/dashboard/clients')
}
