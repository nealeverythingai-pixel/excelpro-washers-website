import { db } from '@/lib/db'
import InvoicesPageClient from './InvoicesPageClient'

export default async function InvoicesPage() {
  const invoices = await db.invoices.getAll()
  const clients = await db.clients.getAll()
  const jobs = await db.jobs.getAll()
  
  return <InvoicesPageClient initialInvoices={invoices} initialClients={clients} initialJobs={jobs} />
}
