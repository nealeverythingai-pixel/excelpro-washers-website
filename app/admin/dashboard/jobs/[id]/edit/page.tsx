import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import EditJobForm from './EditJobForm'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await db.jobs.findById(id)
  
  if (!job) {
    notFound()
  }

  const clients = await db.clients.getAll()
  const users = await db.users.getAll()
  const contractors = users.filter(u => u.role === 'CONTRACTOR' && u.active)

  return (
    <EditJobForm 
      job={job}
      clients={clients} 
      contractors={contractors} 
    />
  )
}
