import Link from 'next/link'
import { Plus, Search, Mail, Phone, MapPin } from 'lucide-react'
import { db } from '@/lib/db'

export default async function RequestsPage() {
  const requests = await db.requests.getAll()

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Incoming work requests from leads</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/dashboard/requests/new"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.length === 0 ? (
           <div className="text-center py-12 text-gray-500">No requests found.</div>
        ) : (
            requests.map((request) => (
            <div key={request.id} className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{request.firstName} {request.lastName}</h3>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {request.status}
                        </span>
                    </div>
                     <div className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="flex items-center"><Mail className="w-3 h-3 mr-1"/> {request.email}</span>
                        <span className="flex items-center"><Phone className="w-3 h-3 mr-1"/> {request.phone}</span>
                     </div>
                     <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-md border border-gray-100 italic">
                        "{request.details}"
                     </p>
                     <p className="text-xs text-gray-400 flex items-center mt-2">
                        <MapPin className="w-3 h-3 mr-1"/> {request.address}
                     </p>
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(request.createdAt).toLocaleDateString()}
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
