import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import QuoteDetailClient from './QuoteDetailClient'

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quote = await db.quotes.findById(id)
  
  if (!quote) {
    notFound()
  }

  const client = await db.clients.findById(quote.clientId)
  
  if (!client) {
    notFound()
  }

  // Get related job if quote was converted
  const allJobs = await db.jobs.getAll()
  const job = quote.status === 'Converted' 
    ? allJobs.find(j => j.title.includes(quote.title) || j.clientId === quote.clientId)
    : null

  return (
    <QuoteDetailClient 
      quote={quote} 
      client={client} 
      job={job || null}
    />
  )
}
