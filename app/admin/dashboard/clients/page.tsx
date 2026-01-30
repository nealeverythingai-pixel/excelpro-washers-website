import Link from 'next/link'
import { Plus, Search, Mail, Phone, MapPin, DollarSign, Briefcase, Star, Calendar } from 'lucide-react'
import { db } from '@/lib/db'
import ClientsPageClient from './ClientsPageClient'

export default async function ClientsPage() {
  const clients = await db.clients.getAll()
  const jobs = await db.jobs.getAll()

  return <ClientsPageClient initialClients={clients} initialJobs={jobs} />
}
