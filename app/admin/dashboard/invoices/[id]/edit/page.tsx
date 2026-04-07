import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import EditInvoiceForm from './EditInvoiceForm'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await db.invoices.findById(id)
  
  if (!invoice) {
    notFound()
  }

  const clients = await db.clients.getAll()
  const jobs = await db.jobs.getAll()
  const completedJobs = jobs.filter(j => j.status === 'Completed')

  return (
    <EditInvoiceForm 
      invoice={invoice}
      clients={clients} 
      completedJobs={completedJobs} 
    />
  )
}
