import { db } from '@/lib/db'
import LeadsPageClient from './LeadsPageClient'

export default async function LeadsPage() {
  const requests = await db.requests.getAll()
  
  return <LeadsPageClient initialRequests={requests} />
}
