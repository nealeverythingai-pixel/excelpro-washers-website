import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import EditQuoteForm from './EditQuoteForm'

export default async function EditQuotePage({ params }: { params: { id: string } }) {
  const quote = await db.quotes.findById(params.id)
  
  if (!quote) {
    notFound()
  }

  // Don't allow editing converted quotes
  if (quote.status === 'Converted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cannot Edit Converted Quote
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This quote has been converted to a job and cannot be edited.
          </p>
        </div>
      </div>
    )
  }

  const clients = await db.clients.getAll()

  return (
    <EditQuoteForm 
      quote={quote}
      clients={clients} 
    />
  )
}
