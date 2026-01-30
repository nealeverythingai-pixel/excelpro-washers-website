'use server'

import { db } from '../../../lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createRequest(formData: FormData) {
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const details = formData.get('details') as string

  await db.requests.create({
    id: `request-${Date.now()}`,
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    email,
    phone,
    address,
    message: details,
    status: 'New',
  })

  revalidatePath('/admin/dashboard/requests')
  redirect('/admin/dashboard/requests')
}
