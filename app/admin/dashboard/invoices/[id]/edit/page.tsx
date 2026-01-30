import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import EditInvoiceForm from './EditInvoiceForm'

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const invoice = await db.invoices.findById(params.id)
  
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
