'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle,
  Printer,
  Download,
  Building2,
  Clock,
  CreditCard
} from 'lucide-react'
import type { Invoice, Client, Job } from '@/lib/types'
import Image from 'next/image'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CustomerInvoiceProps {
  invoice: Invoice
  client: Client
  job: Job | null
}

export default function CustomerInvoice({ invoice, client, job }: CustomerInvoiceProps) {
  const [paymentLoading, setPaymentLoading] = useState(false)

  const isOverdue = () => {
    if (invoice.status === 'Paid') return false
    return new Date(invoice.dueDate) < new Date()
  }

  const getDaysOverdue = () => {
    if (!isOverdue()) return 0
    const diff = new Date().getTime() - new Date(invoice.dueDate).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      if (!response.ok) throw new Error('Failed to generate PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const invoiceNum = invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)
      a.download = `invoice-${invoiceNum}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const handlePayNow = async () => {
    if (invoice.status === 'Paid') {
      alert('This invoice has already been paid.')
      return
    }

    setPaymentLoading(true)
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout using the URL
      if (!url) {
        throw new Error('No checkout URL received')
      }

      window.location.href = url
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment. Please try again or contact us directly.')
      setPaymentLoading(false)
    }
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-full-width {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto print-full-width">
          {/* Action Buttons - Hidden on Print */}
          <div className="no-print flex justify-end gap-3 mb-6">
            {invoice.status !== 'Paid' && (
              <button
                onClick={handlePayNow}
                disabled={paymentLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5" />
                {paymentLoading ? 'Processing...' : 'Pay Now with Card'}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          {/* Invoice Document */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            {/* Header with Company Info */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold mb-2">ExcelPro Washers</h1>
                  <p className="text-sky-100">Professional Pressure Washing Services</p>
                  <div className="mt-4 space-y-1 text-sky-50">
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      (613) 555-WASH
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      info@excelprowashers.com
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Ottawa, ON
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold">INVOICE</div>
                  <div className="mt-2 text-sky-100">
                    #{invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="p-8">
              {/* Status Banner */}
              {invoice.status === 'Paid' && (
                <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-300">
                      Payment Received - Thank You!
                    </span>
                  </div>
                </div>
              )}

              {isOverdue() && invoice.status !== 'Paid' && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <span className="font-semibold text-red-900 dark:text-red-300">
                        Payment Overdue
                      </span>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        This invoice was due {getDaysOverdue()} days ago. Please submit payment at your earliest convenience.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {invoice.status !== 'Paid' && !isOverdue() && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <span className="font-semibold text-blue-900 dark:text-blue-300">
                        Payment Due: {formatDate(invoice.dueDate)}
                      </span>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        You can pay securely online with a credit card using the "Pay Now" button above.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bill To & Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Bill To
                  </h2>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {client.firstName} {client.lastName}
                    </p>
                    {client.companyName && (
                      <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {client.companyName}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">{client.email}</p>
                    {client.phone && (
                      <p className="text-gray-600 dark:text-gray-400">{client.phone}</p>
                    )}
                    {client.address && (
                      <p className="text-gray-600 dark:text-gray-400">{client.address}</p>
                    )}
                  </div>
                </div>

                <div className="md:text-right">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Invoice Details
                  </h2>
                  <div className="space-y-2">
                    <div className="flex md:justify-end gap-2">
                      <span className="text-gray-600 dark:text-gray-400">Invoice Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(invoice.createdAt)}
                      </span>
                    </div>
                    <div className="flex md:justify-end gap-2">
                      <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                      <span className={`font-medium ${isOverdue() && invoice.status !== 'Paid' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {formatDate(invoice.dueDate)}
                      </span>
                    </div>
                    <div className="flex md:justify-end gap-2">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={`font-medium ${
                        invoice.status === 'Paid' ? 'text-green-600 dark:text-green-400' :
                        isOverdue() ? 'text-red-600 dark:text-red-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {invoice.status === 'Paid' ? 'Paid' : isOverdue() ? 'Overdue' : 'Outstanding'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              {job && (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Service Provided
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white">{job.title}</p>
                  {job.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{job.description}</p>
                  )}
                  {job.startDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Service Date: {formatDate(job.startDate)}
                    </p>
                  )}
                </div>
              )}

              {/* Amount Due */}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Amount Due
                  </span>
                  <span className="text-4xl font-bold text-sky-600 dark:text-sky-400">
                    ${invoice.total.toLocaleString()}
                  </span>
                </div>

                {/* Payment Instructions */}
                {invoice.status !== 'Paid' && (
                  <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-6">
                    <h3 className="font-semibold text-sky-900 dark:text-sky-300 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Payment Instructions
                    </h3>
                    <div className="space-y-2 text-sky-800 dark:text-sky-400">
                      <p><strong>E-Transfer:</strong> Send payment to payments@excelprowashers.com</p>
                      <p><strong>Check:</strong> Make payable to "ExcelPro Washers"</p>
                      <p><strong>Cash:</strong> Contact us to arrange payment</p>
                      <p className="text-sm mt-4">
                        Please include invoice #{invoice.id.split('_')[1]?.slice(0, 8) || invoice.id.slice(0, 8)} in your payment reference.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Thank you for choosing ExcelPro Washers!</p>
                <p className="mt-2">
                  Questions about this invoice? Contact us at info@excelprowashers.com or (613) 555-WASH
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info - Hidden on Print */}
          <div className="no-print mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>This is an electronic invoice. No signature is required.</p>
            {invoice.status !== 'Paid' && (
              <p className="mt-2 font-medium text-gray-700 dark:text-gray-300">
                💳 Secure online payments powered by Stripe
              </p>
            )}
            <p className="mt-1">Keep this invoice for your records.</p>
          </div>
        </div>
      </div>
    </>
  )
}
