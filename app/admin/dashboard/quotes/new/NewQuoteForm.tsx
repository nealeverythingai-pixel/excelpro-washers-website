'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, FileText } from 'lucide-react'
import type { Client } from '@/lib/types'

interface NewQuoteFormProps {
  clients: Client[]
}

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export default function NewQuoteForm({ clients }: NewQuoteFormProps) {
  const router = useRouter()
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ])
  const [taxRate, setTaxRate] = useState(0) // percentage
  const [discount, setDiscount] = useState(0) // dollar amount
  const [loading, setLoading] = useState(false)

  // Calculate line item total
  const getLineTotal = (item: LineItem) => {
    return item.quantity * item.unitPrice
  }

  // Calculate subtotal
  const subtotal = lineItems.reduce((sum, item) => sum + getLineTotal(item), 0)

  // Calculate tax
  const taxAmount = (subtotal - discount) * (taxRate / 100)

  // Calculate grand total
  const total = subtotal - discount + taxAmount

  // Add new line item
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
    ])
  }

  // Remove line item
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  // Update line item
  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, sendImmediately: boolean = false) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Filter out empty line items
      const validLineItems = lineItems.filter(item =>
        item.description.trim() && item.quantity > 0 && item.unitPrice > 0
      )

      if (validLineItems.length === 0) {
        alert('Please add at least one line item with description, quantity, and price')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          title,
          items: validLineItems.map(({ id, ...item }) => item), // Remove id field
          total,
          status: sendImmediately ? 'Sent' : 'Draft',
          taxRate,
          discount,
          subtotal
        })
      })

      if (response.ok) {
        const data = await response.json()

        // If sending immediately, trigger email
        if (sendImmediately) {
          await fetch(`/api/admin/quotes/${data.quote.id}/send`, {
            method: 'POST'
          })
        }

        router.push('/admin/dashboard/quotes')
        router.refresh()
      } else {
        alert('Failed to create quote')
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">New Quote</h1>
          <p className="mt-1 text-sm text-zinc-500">Create a detailed quote with line items</p>
        </div>
        <Link
          href="/admin/dashboard/quotes"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Client and Title */}
        <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Quote Details</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Client *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                    {client.companyName && ` - ${client.companyName}`}
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
                placeholder="e.g. Window Cleaning - Spring 2026"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid gap-3 md:grid-cols-12 items-start p-4 border border-zinc-800 rounded-lg">
                {/* Description */}
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Service description"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-600 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Unit Price */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                {/* Line Total */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Total
                  </label>
                  <div className="flex items-center h-[38px] px-3 py-2 text-sm font-semibold text-zinc-100 bg-zinc-800 border border-zinc-800 rounded-md">
                    ${getLineTotal(item).toFixed(2)}
                  </div>
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                    className="p-2 text-red-600 hover:text-red-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
                    title="Remove item"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations */}
        <div className="rounded-lg bg-zinc-900 p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Pricing</h2>

          <div className="space-y-4 max-w-md ml-auto">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-zinc-100">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between">
              <label className="text-zinc-200">Discount</label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Tax Rate */}
            <div className="flex items-center justify-between">
              <label className="text-zinc-200">Tax Rate</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-20 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <span className="text-zinc-500">%</span>
              </div>
            </div>

            {/* Tax Amount */}
            {taxRate > 0 && (
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Tax ({taxRate}%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between text-lg font-bold text-zinc-100 pt-4 border-t border-zinc-800">
              <span>Total</span>
              <span className="text-sky-400">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <Link
            href="/admin/dashboard/quotes"
            className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !clientId || !title}
            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading || !clientId || !title}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed transition-colors inline-flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Save & Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
