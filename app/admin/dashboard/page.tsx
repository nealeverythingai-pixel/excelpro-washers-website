import {
  TrendingUp,
  Users,
  Flame,
  Thermometer,
  DollarSign,
  Inbox,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { db } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const requests = await db.requests.getAll()
  const clients = await db.clients.getAll()
  const jobs = await db.jobs.getAll()
  const quotes = await db.quotes.getAll()
  const invoices = await db.invoices.getAll()

  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const requestsThisMonth = requests.filter(r => new Date(r.createdAt) >= firstDayOfMonth)

  const hotLeads = requests.filter(r => r.aiCategory === 'hot' && r.status !== 'Converted').length
  const warmLeads = requests.filter(r => r.aiCategory === 'warm' && r.status !== 'Converted').length
  const coldLeads = requests.filter(r => r.aiCategory === 'cold' && r.status !== 'Converted').length

  const completedJobs = jobs.filter(j => j.status === 'Completed')
  const revenueThisMonth = completedJobs
    .filter(j => new Date(j.createdAt) >= firstDayOfMonth)
    .reduce((acc, curr) => acc + (curr.total || 0), 0)
  const totalRevenue = completedJobs.reduce((acc, curr) => acc + (curr.total || 0), 0)

  const convertedLeads = requests.filter(r => r.status === 'Converted').length
  const conversionRate = requests.length > 0 ? ((convertedLeads / requests.length) * 100).toFixed(1) : '0.0'

  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingJobs = jobs.filter(j => {
    const startDate = new Date(j.startDate)
    return j.status === 'Scheduled' && startDate >= now && startDate <= sevenDaysFromNow
  })

  const pendingQuotes = quotes.filter(q => q.status === 'Sent').length
  const outstandingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue')
  const outstandingAmount = outstandingInvoices.reduce((acc, curr) => acc + curr.total, 0)

  const recentLeads = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    { name: 'Leads This Month', value: requestsThisMonth.length.toString(), icon: Inbox,      iconBg: 'bg-blue-500',   href: '/admin/dashboard/leads' },
    { name: 'Hot Leads',        value: hotLeads.toString(),                  icon: Flame,      iconBg: 'bg-red-500',    href: '/admin/dashboard/leads?filter=hot' },
    { name: 'Revenue This Month', value: `$${revenueThisMonth.toLocaleString()}`, icon: DollarSign, iconBg: 'bg-green-500', href: '/admin/dashboard/invoices' },
    { name: 'Conversion Rate',  value: `${conversionRate}%`,                icon: TrendingUp, iconBg: 'bg-purple-500', href: '/admin/dashboard/leads' },
  ]

  const getCategoryIcon = (category?: string) => {
    switch(category) {
      case 'hot':  return <Flame       className="h-4 w-4 text-red-400" />
      case 'warm': return <Thermometer className="h-4 w-4 text-orange-400" />
      case 'cold': return <Thermometer className="h-4 w-4 text-blue-400" />
      default:     return <Inbox       className="h-4 w-4 text-zinc-500" />
    }
  }

  const getCategoryBadge = (category?: string) => {
    switch(category) {
      case 'hot':  return 'bg-red-500/15 text-red-400 ring-red-500/30'
      case 'warm': return 'bg-orange-500/15 text-orange-400 ring-orange-500/30'
      case 'cold': return 'bg-blue-500/15 text-blue-400 ring-blue-500/30'
      default:     return 'bg-zinc-700 text-zinc-400 ring-zinc-600/30'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">Monitor your business performance and activity</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/dashboard/leads?filter=hot"
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            <Flame className="mr-2 h-4 w-4" />
            View Hot Leads
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all"
          >
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{stat.name}</p>
              <p className="mt-2 text-3xl font-bold text-zinc-100">{stat.value}</p>
            </div>
            <div className={`${stat.iconBg} rounded-xl p-3 text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Lead Funnel */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-base font-semibold text-zinc-100 mb-4">Lead Funnel</h3>
        <div className="grid grid-cols-3 gap-4">
          <Link href="/admin/dashboard/leads?filter=hot"
            className="group rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4 hover:border-red-500/60 hover:bg-red-500/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <Flame className="h-5 w-5 text-red-400" />
              <span className="text-2xl font-bold text-red-400">{hotLeads}</span>
            </div>
            <p className="text-sm font-medium text-zinc-300">Hot Leads</p>
            <p className="text-xs text-zinc-600 mt-0.5">Need immediate action</p>
          </Link>

          <Link href="/admin/dashboard/leads?filter=warm"
            className="group rounded-xl border-2 border-orange-500/30 bg-orange-500/5 p-4 hover:border-orange-500/60 hover:bg-orange-500/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <Thermometer className="h-5 w-5 text-orange-400" />
              <span className="text-2xl font-bold text-orange-400">{warmLeads}</span>
            </div>
            <p className="text-sm font-medium text-zinc-300">Warm Leads</p>
            <p className="text-xs text-zinc-600 mt-0.5">In nurture sequence</p>
          </Link>

          <Link href="/admin/dashboard/leads?filter=cold"
            className="group rounded-xl border-2 border-blue-500/30 bg-blue-500/5 p-4 hover:border-blue-500/60 hover:bg-blue-500/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <Thermometer className="h-5 w-5 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{coldLeads}</span>
            </div>
            <p className="text-sm font-medium text-zinc-300">Cold Leads</p>
            <p className="text-xs text-zinc-600 mt-0.5">Long-term nurture</p>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <h3 className="text-base font-semibold text-zinc-100">Recent Leads</h3>
            <Link href="/admin/dashboard/leads" className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-zinc-800/60">
            {recentLeads.length === 0 ? (
              <li className="px-6 py-5 text-sm text-zinc-600">No leads yet.</li>
            ) : (
              recentLeads.map((lead) => (
                <li key={lead.id} className="px-6 py-4 hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 gap-3">
                      {getCategoryIcon(lead.aiCategory)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {lead.name || `${lead.firstName} ${lead.lastName}`}
                        </p>
                        <p className="text-xs text-zinc-500">{lead.service || 'Service inquiry'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {lead.aiScore && (
                        <span className="text-sm font-semibold text-zinc-400">{lead.aiScore}</span>
                      )}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getCategoryBadge(lead.aiCategory)}`}>
                        {lead.aiCategory || 'new'}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Action Items */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h3 className="text-base font-semibold text-zinc-100">Action Items</h3>
          </div>
          <div className="p-5 space-y-3">
            <Link href="/admin/dashboard/jobs"
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/15 p-2 group-hover:bg-blue-500/25 transition-colors">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Upcoming Jobs</p>
                  <p className="text-xs text-zinc-500">Next 7 days</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-400">{upcomingJobs.length}</span>
            </Link>

            <Link href="/admin/dashboard/quotes"
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/15 p-2 group-hover:bg-purple-500/25 transition-colors">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Pending Quotes</p>
                  <p className="text-xs text-zinc-500">Awaiting response</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-400">{pendingQuotes}</span>
            </Link>

            <Link href="/admin/dashboard/invoices"
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 hover:border-green-500/40 hover:bg-green-500/5 transition-all group">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/15 p-2 group-hover:bg-green-500/25 transition-colors">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Outstanding</p>
                  <p className="text-xs text-zinc-500">${outstandingAmount.toLocaleString()} owed</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-400">{outstandingInvoices.length}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Business Metrics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200">Total Clients</p>
              <p className="text-3xl font-bold mt-2">{clients.length}</p>
            </div>
            <Users className="h-10 w-10 text-blue-300/60" />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-600 to-green-700 p-6 text-white shadow-lg shadow-green-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-200">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-300/60" />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white shadow-lg shadow-purple-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-200">Completed Jobs</p>
              <p className="text-3xl font-bold mt-2">{completedJobs.length}</p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-purple-300/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
