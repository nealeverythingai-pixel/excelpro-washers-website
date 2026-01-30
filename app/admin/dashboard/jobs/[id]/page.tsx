import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import JobDetailClient from './JobDetailClient'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await db.jobs.findById(params.id)
  
  if (!job) {
    notFound()
  }

  const client = await db.clients.findById(job.clientId)
  
  if (!client) {
    notFound()
  }

  // Get contractor if assigned
  const contractor = job.contractorId ? await db.users.findById(job.contractorId) : null

  // Get related invoice if exists
  const allInvoices = await db.invoices.getAll()
  const invoice = allInvoices.find(inv => inv.jobId === job.id)

  return (
    <JobDetailClient 
      job={job} 
      client={client} 
      contractor={contractor}
      invoice={invoice || null}
    />
  )
}
