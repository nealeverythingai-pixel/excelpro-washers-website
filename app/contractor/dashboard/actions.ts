'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Job } from '@/lib/types'
import { cookies } from 'next/headers'

export async function getJobs() {
  const cookieStore = await cookies()
  const contractorId = cookieStore.get('contractor_session')?.value
  
  const jobs = await db.jobs.getAll()
  const clients = await db.clients.getAll()
  
  // Filter jobs logic:
  // 1. Available jobs: availableToContractors=true AND no assignedContractorId
  // 2. Assigned jobs: assignedContractorId matches THIS contractor
  
  const filteredJobs = jobs.filter(job => {
      // Show unassigned available jobs
      if (job.availableToContractors && !job.assignedContractorId) return true
      
      // Show jobs assigned to THIS contractor
      return job.assignedContractorId === contractorId
  })

  // Enrich jobs with client details for display
  return filteredJobs.map(job => {
    const client = clients.find(c => c.id === job.clientId)
    return {
      ...job,
      clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
      clientAddress: client ? client.address : '',
    }
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

export async function acceptJob(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const cookieStore = await cookies()
  const contractorId = cookieStore.get('contractor_session')?.value

  if (!jobId || !contractorId) return

  // Call the /api/jobs/accept endpoint which handles race conditions
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/jobs/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, contractorId }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to accept job:', data.error)
      // Job might have been taken by another contractor
    }

    revalidatePath('/contractor/dashboard')
  } catch (error) {
    console.error('Error accepting job:', error)
  }
}

export async function uploadBeforePhotos(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const photos = JSON.parse(formData.get('photos') as string || '[]') as string[]

  if (!jobId || photos.length < 3) return

  await db.jobs.update(jobId, {
    beforePhotos: photos,
    beforePhotosUploadedAt: new Date().toISOString(),
    status: 'Active', // Move to active once before photos uploaded
  })
  revalidatePath('/contractor/dashboard')
}

export async function uploadAfterPhotos(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const photos = JSON.parse(formData.get('photos') as string || '[]') as string[]

  if (!jobId || photos.length < 3) return

  await db.jobs.update(jobId, {
    afterPhotos: photos,
    afterPhotosUploadedAt: new Date().toISOString(),
  })
  revalidatePath('/contractor/dashboard')
}

export async function submitClientSignoff(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const clientName = formData.get('clientName') as string
  const notes = formData.get('notes') as string

  if (!jobId || !clientName?.trim()) return

  await db.jobs.update(jobId, {
    clientSignoff: true,
    clientSignoffName: clientName.trim(),
    clientSignoffAt: new Date().toISOString(),
    clientSignoffNotes: notes || undefined,
  })
  revalidatePath('/contractor/dashboard')
}

export async function completeJob(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const proofOfWork = formData.get('proofOfWork') as string
  const notes = formData.get('notes') as string

  if (!jobId) return

  // Verify all requirements are met before allowing completion
  const job = await db.jobs.findById(jobId)
  if (!job) return

  if ((job.beforePhotos?.length || 0) < 3) {
    console.error('Cannot complete job: missing before photos')
    return
  }
  if ((job.afterPhotos?.length || 0) < 3) {
    console.error('Cannot complete job: missing after photos')
    return
  }
  if (!job.clientSignoff) {
    console.error('Cannot complete job: missing client sign-off')
    return
  }

  await db.jobs.update(jobId, {
    status: 'Completed',
    proofOfWork: proofOfWork || job.afterPhotos?.[0] || undefined,
    contractorNotes: notes || undefined,
  })

  // Update contractor stats
  const cookieStore = await cookies()
  const contractorId = cookieStore.get('contractor_session')?.value
  if (contractorId) {
    const contractor = await db.users.findById(contractorId)
    if (contractor) {
      await db.users.update(contractorId, {
        completedJobs: (contractor.completedJobs || 0) + 1,
        totalEarnings: (contractor.totalEarnings || 0) + (job.contractorEarnings || 0),
      })
    }
  }

  revalidatePath('/contractor/dashboard')
}
