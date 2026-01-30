import { getJobs } from './actions'
import ContractorView from './ContractorView'

export const dynamic = 'force-dynamic'

export default async function ContractorDashboard() {
  const jobs = await getJobs()

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
      </div>
      
      <ContractorView jobs={jobs} />
    </div>
  )
}
