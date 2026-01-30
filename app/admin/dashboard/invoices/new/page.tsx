import { db } from '@/lib/db'
import NewInvoiceForm from './NewInvoiceForm'

export default async function NewInvoicePage() {
  const clients = await db.clients.getAll()
  const jobs = await db.jobs.getAll()
  
  // Filter completed jobs only for invoicing
  const completedJobs = jobs.filter(j => j.status === 'Completed')

  return <NewInvoiceForm clients={clients} completedJobs={completedJobs} />
}
