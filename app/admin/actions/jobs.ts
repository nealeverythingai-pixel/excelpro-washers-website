'use server'

import { db } from '../../../lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createJob(formData: FormData) {
  const clientId = formData.get('clientId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const startDate = formData.get('startDate') as string
  const endDate = formData.get('endDate') as string // Optional
  const total = parseFloat(formData.get('total') as string) || 0

  if (!clientId || !title || !startDate) {
    // In a real app we'd handle errors better
    return { error: 'Please fill in required fields' }
  }

  await db.jobs.create({
    clientId,
    title,
    description,
    startDate,
    endDate,
    total,
    status: 'Scheduled'
  })

  revalidatePath('/admin/dashboard/jobs')
  revalidatePath('/admin/dashboard') 
  redirect('/admin/dashboard/jobs')
}

export async function deleteJob(id: string) {
  await db.jobs.delete(id)
  revalidatePath('/admin/dashboard/jobs')
  revalidatePath('/admin/dashboard')
}
