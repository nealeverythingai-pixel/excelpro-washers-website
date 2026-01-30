import Link from 'next/link'
import { Plus, Search, Calendar, User, DollarSign } from 'lucide-react'
import { db } from '@/lib/db'
import { Job, Client } from '@/lib/types'
import JobsPageClient from './JobsPageClient'

export default async function JobsPage() {
  const jobs = await db.jobs.getAll()
  const clients = await db.clients.getAll()
  
  return <JobsPageClient initialJobs={jobs} initialClients={clients} />
}
