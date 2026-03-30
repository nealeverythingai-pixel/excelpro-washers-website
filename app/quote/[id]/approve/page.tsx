import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'

export default async function QuoteApprovePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const quote = await db.quotes.findById(id)

  if (!quote) notFound()

  const client = await db.clients.findById(quote.clientId)
  if (!client) notFound()

  // Already approved — go straight to scheduling
  if (quote.status === 'Approved' || quote.status === 'Converted') {
    redirect(`/quote/${id}/schedule`)
  }

  const subtotal = quote.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo-horizontal.svg" alt="ExcelPro Washers" className="h-14 mx-auto" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-6">
            <p className="text-sky-100 text-sm font-semibold uppercase tracking-wide mb-1">
              Quote #{id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="text-white text-2xl font-bold">{quote.title}</h1>
            <p className="text-sky-100 text-sm mt-1">Prepared for {client.firstName} {client.lastName}</p>
          </div>

          <div className="px-8 py-6">

            {/* Items */}
            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-400 font-semibold uppercase text-xs tracking-wide">Service</th>
                  <th className="text-center py-2 text-gray-400 font-semibold uppercase text-xs tracking-wide">Qty</th>
                  <th className="text-right py-2 text-gray-400 font-semibold uppercase text-xs tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 text-gray-700">{item.description}</td>
                    <td className="py-3 text-center text-gray-500">{item.quantity}</td>
                    <td className="py-3 text-right font-medium text-gray-800">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-between items-center bg-sky-50 rounded-xl px-4 py-3 mb-8">
              <span className="text-gray-600 font-medium">Quote Total</span>
              <span className="text-2xl font-bold text-sky-600">${quote.total.toFixed(2)}</span>
            </div>

            {/* Approve form */}
            <form action={`/api/quote/${id}/approve`} method="POST">
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 rounded-xl transition-colors"
              >
                ✓ Approve Quote &amp; Select a Date
              </button>
            </form>

            <p className="text-center text-gray-400 text-xs mt-4">
              By approving you agree to have ExcelPro Washers perform the services listed above.
              You will be asked to pick a date on the next screen.
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          ExcelPro Washers · (343) 574-0300 · Ottawa, ON
        </p>
      </div>
    </div>
  )
}
