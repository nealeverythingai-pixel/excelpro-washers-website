import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ClientDetailView } from './ClientDetailView'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await db.clients.getById(params.id)
  if (!client) notFound()

  const [jobs, quotes, invoices] = await Promise.all([
    db.jobs.getByClientId(params.id),
    db.quotes.getByClientId(params.id),
    db.invoices.getByClientId(params.id),
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
