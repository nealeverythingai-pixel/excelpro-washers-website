import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ClientDetailView } from './ClientDetailView'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await db.clients.getById(id)
  if (!client) notFound()

  const [jobs, quotes, invoices] = await Promise.all([
    db.jobs.getByClientId(id),
    db.quotes.getByClientId(id),
    db.invoices.getByClientId(id),
  ])

  return (
    <ClientDetailView
      client={client}
      jobs={jobs}
      quotes={quotes}
      invoices={invoices}
    />
  )
}
