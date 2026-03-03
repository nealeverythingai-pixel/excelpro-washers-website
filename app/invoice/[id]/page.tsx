import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import CustomerInvoice from './CustomerInvoice'

export const metadata = {
  title: 'Invoice - ExcelPro Washers',
  description: 'View your invoice from ExcelPro Washers',
}

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await db.invoices.findById(id)
  
  if (!invoice) {
    notFound()
  }

  const client = await db.clients.findById(invoice.clientId)
  const job = invoice.jobId ? await db.jobs.findById(invoice.jobId) : null

  if (!client) {
    notFound()
  }

  return (
    <CustomerInvoice 
      invoice={invoice} 
      client={client} 
      job={job || null}
    />
  )
}
