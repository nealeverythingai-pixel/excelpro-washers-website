'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { Job } from '@/lib/types'
import { cookies } from 'next/headers'

export async function getJobs() {
  const contractorId = cookies().get('contractor_session')?.value
  
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
  const contractorId = cookies().get('contractor_session')?.value

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

export async function completeJob(formData: FormData) {
  const jobId = formData.get('jobId') as string
  const proofOfWork = formData.get('proofOfWork') as string // URL or Base64
  const notes = formData.get('notes') as string

  if (!jobId) return

  await db.jobs.update(jobId, {
    status: 'Completed',
    proofOfWork: proofOfWork || undefined,
    contractorNotes: notes || undefined
  })
  revalidatePath('/contractor/dashboard')
}
