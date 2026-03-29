'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileText, Plus, X, Package, DollarSign } from 'lucide-react'
import type { Quote, Client } from '@/lib/types'

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface EditQuoteFormProps {
  quote: Quote
  clients: Client[]
}

export default function EditQuoteForm({ quote, clients }: EditQuoteFormProps) {
  const router = useRouter()
  const [clientId, setClientId] = useState(quote.clientId)
  const [title, setTitle] = useState(quote.title)
  const [items, setItems] = useState<LineItem[]>(
    quote.items.map((item, index) => ({
      id: `item_${Date.now()}_${index}`,
      ...item
    }))
  )
  const [discount, setDiscount] = useState('0')
  const [taxRate, setTaxRate] = useState('13')
  const [status, setStatus] = useState(quote.status)
  const [loading, setLoading] = useState(false)

  const getLineTotal = (item: LineItem) => item.quantity * item.unitPrice

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + getLineTotal(item), 0)
  const discountAmount = parseFloat(discount) || 0
  const taxAmount = (subtotal - discountAmount) * (parseFloat(taxRate) / 100)
  const total = subtotal - discountAmount + taxAmount

  const addLineItem = () => {
    setItems([...items, {
      id: `item_${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0
    }])
  }

  const removeLineItem = (id: string) => {
    if (items.length === 1) {
      alert('Quote must have at least one line item')
      return
    }
    setItems(items.filter(item => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty items
    const validItems = items.filter(item => item.description.trim() !== '')

    if (!clientId || !title || validItems.length === 0) {
      alert('Please fill in all required fields and add at least one line item')
      return
    }

    // Prepare items data without the id field
    const itemsData = validItems.map(({ description, quantity, unitPrice }) => ({
      description,
      quantity,
      unitPrice
    }))

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          title,
          items: itemsData,
          total,
          status,
        }),
      })

      if (response.ok) {
        router.push(`/admin/dashboard/quotes/${quote.id}`)
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update quote')
      }
    } catch (error) {
      console.error('Error updating quote:', error)
      alert('Failed to update quote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/admin/dashboard/quotes/${quote.id}`)}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quote
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Edit Quote
          </h1>
          <p className="text-zinc-400">
            Update quote #{quote.id.split('_')[1]?.slice(0, 8) || quote.id.slice(0, 8)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quote Details Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Quote Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Client *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                      {client.companyName ? ` - ${client.companyName}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Quote Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100 placeholder:text-zinc-600"
                  placeholder="e.g., Residential Pressure Washing Service"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Quote['status'])}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-sky-400" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-100">Line Items</h2>
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 bg-zinc-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-12 gap-3">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100 placeholder:text-zinc-600"
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                          min="0"
                          step="1"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                          Total
                        </label>
                        <div className="px-3 py-2 bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-100">
                          ${getLineTotal(item).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="mt-6 p-2 text-red-400 hover:bg-red-500/15 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-sky-500/15 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-100">Pricing</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-medium text-zinc-100">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Discount ($)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100 placeholder:text-zinc-600"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-zinc-100 placeholder:text-zinc-600"
                    placeholder="13.00"
                  />
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Discount</span>
                  <span className="text-red-400">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Tax ({taxRate}%)</span>
                <span className="text-zinc-100">
                  ${taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="pt-4 border-t-2 border-zinc-800">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span className="text-zinc-100">Total</span>
                  <span className="text-sky-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Updating...' : 'Update Quote'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/dashboard/quotes/${quote.id}`)}
              className="px-6 py-3 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
