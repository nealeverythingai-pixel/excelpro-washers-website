import { db } from '@/lib/db'
import NewJobForm from './NewJobForm'

export default async function NewJobPage() {
  const clients = await db.clients.getAll()
  const users = await db.users.getAll()
  
  // Filter contractors only
  const contractors = users.filter(u => u.role === 'CONTRACTOR' && u.active)

  return <NewJobForm clients={clients} contractors={contractors} />
}
