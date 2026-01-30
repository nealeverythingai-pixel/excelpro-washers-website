import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import InvoiceDetailClient from './InvoiceDetailClient'

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await db.invoices.findById(params.id)
  
  if (!invoice) {
    notFound()
  }

  const client = await db.clients.findById(invoice.clientId)
  const job = invoice.jobId ? await db.jobs.findById(invoice.jobId) : null

  if (!client) {
    notFound()
  }

  return (
    <InvoiceDetailClient 
      invoice={invoice} 
      client={client} 
      job={job}
    />
  )
}
