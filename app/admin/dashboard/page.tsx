import { 
  TrendingUp,
  Users, 
  Flame,
  Thermometer,
  DollarSign,
  Inbox,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
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

  // Lead Stats (This Month)
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const requestsThisMonth = requests.filter(r => new Date(r.createdAt) >= firstDayOfMonth)
  
  const hotLeads = requests.filter(r => r.aiCategory === 'hot' && r.status !== 'Converted').length
  const warmLeads = requests.filter(r => r.aiCategory === 'warm' && r.status !== 'Converted').length
  const coldLeads = requests.filter(r => r.aiCategory === 'cold' && r.status !== 'Converted').length

  // Revenue Stats
  const completedJobs = jobs.filter(j => j.status === 'Completed')
  const revenueThisMonth = completedJobs
    .filter(j => new Date(j.createdAt) >= firstDayOfMonth)
    .reduce((acc, curr) => acc + (curr.total || 0), 0)
  const totalRevenue = completedJobs.reduce((acc, curr) => acc + (curr.total || 0), 0)

  // Conversion Rate
  const convertedLeads = requests.filter(r => r.status === 'Converted').length
  const conversionRate = requests.length > 0 ? ((convertedLeads / requests.length) * 100).toFixed(1) : '0.0'

  // Upcoming Jobs (Next 7 days)
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingJobs = jobs.filter(j => {
    const startDate = new Date(j.startDate)
    return j.status === 'Scheduled' && startDate >= now && startDate <= sevenDaysFromNow
  })

  // Pending Quotes
  const pendingQuotes = quotes.filter(q => q.status === 'Sent').length

  // Outstanding Invoices
  const outstandingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue')
  const outstandingAmount = outstandingInvoices.reduce((acc, curr) => acc + curr.total, 0)

  // Recent Leads (Last 5)
  const recentLeads = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    { 
      name: 'Leads This Month', 
      value: requestsThisMonth.length.toString(), 
      icon: Inbox,
      color: 'bg-blue-500',
      href: '/admin/dashboard/leads'
    },
    { 
      name: 'Hot Leads', 
      value: hotLeads.toString(), 
      icon: Flame,
      color: 'bg-red-500',
      href: '/admin/dashboard/leads?filter=hot'
    },
    { 
      name: 'Revenue This Month', 
      value: `$${revenueThisMonth.toLocaleString()}`, 
      icon: DollarSign,
      color: 'bg-green-500',
      href: '/admin/dashboard/invoices'
    },
    { 
      name: 'Conversion Rate', 
      value: `${conversionRate}%`, 
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/admin/dashboard/leads'
    },
  ]

  const getCategoryIcon = (category?: string) => {
    switch(category) {
      case 'hot': return <Flame className="h-4 w-4 text-red-500" />
      case 'warm': return <Thermometer className="h-4 w-4 text-orange-500" />
      case 'cold': return <Thermometer className="h-4 w-4 text-blue-400" />
      default: return <Inbox className="h-4 w-4 text-gray-400" />
    }
  }

  const getCategoryColor = (category?: string) => {
    switch(category) {
      case 'hot': return 'bg-red-50 text-red-700 ring-red-600/20'
      case 'warm': return 'bg-orange-50 text-orange-700 ring-orange-600/20'
      case 'cold': return 'bg-blue-50 text-blue-700 ring-blue-600/20'
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20'
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Monitor your business performance and activity</p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Link 
            href="/admin/dashboard/leads?filter=hot" 
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
          >
            <Flame className="mr-2 h-4 w-4" />
            View Hot Leads
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link 
            key={stat.name}
            href={stat.href}
            className="group overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow hover:shadow-md transition-shadow sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{stat.value}</dd>
              </div>
              <div className={`${stat.color} rounded-lg p-3 text-white group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Lead Funnel */}
      <div className="rounded-lg bg-white dark:bg-gray-800 shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Lead Funnel</h3>
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/admin/dashboard/leads?filter=hot"
            className="group p-4 rounded-lg border-2 border-red-200 dark:border-red-900 hover:border-red-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{hotLeads}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Hot Leads</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Need immediate action</p>
          </Link>

          <Link
            href="/admin/dashboard/leads?filter=warm"
            className="group p-4 rounded-lg border-2 border-orange-200 dark:border-orange-900 hover:border-orange-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{warmLeads}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Warm Leads</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">In nurture sequence</p>
          </Link>

          <Link
            href="/admin/dashboard/leads?filter=cold"
            className="group p-4 rounded-lg border-2 border-blue-200 dark:border-blue-900 hover:border-blue-400 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="h-5 w-5 text-blue-400" />
              <span className="text-2xl font-bold text-blue-600">{coldLeads}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Cold Leads</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Long-term nurture</p>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Leads</h3>
            <Link href="/admin/dashboard/leads" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentLeads.length === 0 ? (
              <li className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">No leads yet.</li>
            ) : (
              recentLeads.map((lead) => (
                <li key={lead.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      {getCategoryIcon(lead.aiCategory)}
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.name || `${lead.firstName} ${lead.lastName}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{lead.service || 'Service inquiry'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {lead.aiScore && (
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {lead.aiScore}
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getCategoryColor(lead.aiCategory)}`}>
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
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Action Items</h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Upcoming Jobs */}
            <Link
              href="/admin/dashboard/jobs"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Upcoming Jobs</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Next 7 days</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{upcomingJobs.length}</span>
            </Link>

            {/* Pending Quotes */}
            <Link
              href="/admin/dashboard/quotes"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
            >
              <div className="flex items-center">
                <div className="bg-purple-100 dark:bg-purple-900/40 rounded-lg p-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Pending Quotes</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting response</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{pendingQuotes}</span>
            </Link>

            {/* Outstanding Invoices */}
            <Link
              href="/admin/dashboard/invoices"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
            >
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900/40 rounded-lg p-2 group-hover:bg-green-200 dark:group-hover:bg-green-900/60">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Outstanding</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">${outstandingAmount.toLocaleString()} owed</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{outstandingInvoices.length}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Business Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Clients</p>
              <p className="text-3xl font-bold mt-2">{clients.length}</p>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Completed Jobs</p>
              <p className="text-3xl font-bold mt-2">{completedJobs.length}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
