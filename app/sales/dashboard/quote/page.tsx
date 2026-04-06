import { Suspense } from 'react'
import { SalesQuoteForm } from './SalesQuoteForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewQuotePage() {
  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto">
      {/* Back nav */}
      <Link href="/sales/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 mb-4 active:scale-95 transition-all">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <Suspense fallback={null}>
        <SalesQuoteForm />
      </Suspense>
    </div>
  )
}
