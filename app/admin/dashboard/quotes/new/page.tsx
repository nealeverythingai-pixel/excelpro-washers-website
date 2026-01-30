import { db } from '@/lib/db'
import NewQuoteForm from './NewQuoteForm'

export default async function NewQuotePage() {
  const clients = await db.clients.getAll()

  return <NewQuoteForm clients={clients} />
}
