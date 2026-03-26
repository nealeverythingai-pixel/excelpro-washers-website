'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

import { cookies } from 'next/headers'
import { verifyPortalSession } from '@/lib/session'

function getContractorId(cookieStore: any): string | undefined {
  const raw = cookieStore.get('contractor_session')?.value
  // New signed cookie — extract userId from payload
  const session = verifyPortalSession(raw, 'CONTRACTOR')
  if (session) return session.userId
  // Legacy fallback for plain-text userId cookies (will be rejected by middleware anyway)
  return raw
}

export async function getJobs() {
  const cookieStore = await cookies()
  const contractorId = getContractorId(cookieStore)
  
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
  const contractorId = getContractorId(cookieStore)

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

export async function getMyAvailability() {
  const cookieStore = await cookies()
  const contractorId = getContractorId(cookieStore)
  if (!contractorId) return { availability: [], blocks: [] }
  const [availability, blocks] = await Promise.all([
    db.contractorAvailability.getByContractorId(contractorId),
    db.contractorBlocks.getByContractorId(contractorId),
  ])
  return { availability, blocks }
}

export async function setAvailabilityDay(formData: FormData) {
  const cookieStore = await cookies()
  const contractorId = getContractorId(cookieStore)
  if (!contractorId) return
  const dayOfWeek = parseInt(formData.get('dayOfWeek') as string)
  const enabled = formData.get('enabled') === 'true'
  const startTime = (formData.get('startTime') as string) || '08:00'
  const endTime = (formData.get('endTime') as string) || '17:00'
  if (enabled) {
    await db.contractorAvailability.setDay(contractorId, dayOfWeek, startTime, endTime)
  } else {
    await db.contractorAvailability.removeDay(contractorId, dayOfWeek)
  }
  revalidatePath('/contractor/dashboard')
}

export async function addBlock(formData: FormData) {
  const cookieStore = await cookies()
  const contractorId = getContractorId(cookieStore)
  if (!contractorId) return
  const blockDate = formData.get('blockDate') as string
  const reason = (formData.get('reason') as string) || ''
  if (!blockDate) return
  await db.contractorBlocks.create(contractorId, blockDate, reason || undefined)
  revalidatePath('/contractor/dashboard')
}

export async function removeBlock(formData: FormData) {
  const blockId = formData.get('blockId') as string
  if (!blockId) return
  await db.contractorBlocks.delete(blockId)
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
  const contractorId = getContractorId(cookieStore)
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
