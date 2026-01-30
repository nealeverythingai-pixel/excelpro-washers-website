import { db } from '@/lib/db'
import QuotesPageClient from './QuotesPageClient'

export default async function QuotesPage() {
  const quotes = await db.quotes.getAll()
  const clients = await db.clients.getAll()
  
  return <QuotesPageClient initialQuotes={quotes} initialClients={clients} />
}
