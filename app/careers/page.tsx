import Link from 'next/link'
import { DollarSign, Clock, TrendingUp, Users, ArrowRight, Zap, Target, Star } from 'lucide-react'

export const metadata = {
  title: 'Careers - Join Our Sales Team | ExcelPro Washers',
  description: 'Immediate opening for Door-to-Door Sales Representatives. High commission, flexible hours, and growth opportunities.',
}

export default function CareersPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <div className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400 ring-1 ring-inset ring-orange-500/20 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-orange-400 mr-2 animate-pulse"></span>
              Urgent Hiring - 2026 Season
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Turn Conversations Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Cash</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              We are looking for ambitious, high-energy individuals to join our elite Door-to-Door Sales Team. 
              No caps on commission. No ceiling on your potential.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <a
                href="mailto:careers@excelprowashers.com?subject=Application for Sales Rep Position"
                className="rounded-md bg-orange-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
              >
                Apply Now <span aria-hidden="true">→</span>
              </a>
              <Link href="/about" className="text-sm font-semibold leading-6 text-white">
                Learn more about us <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Join ExcelPro?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              This isn't just a job; it's a launchpad for your career and financial freedom.
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <DollarSign className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
                Uncapped Commission
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Top performers earn <strong>$1,500 - $2,500+ weekly</strong>. You get paid what you are worth. Our aggressive commission structure means every door is an opportunity.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Clock className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                Flexible Schedule
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  You control your hours. Whether you want to hustle 6 days a week or balance it with school/work, we support your drive.
                </p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <TrendingUp className="h-5 w-5 flex-none text-purple-600" aria-hidden="true" />
                Growth & Training
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Master the art of sales with daily training from top industry experts. We promote from within—team leader positions available soon.
                </p>
              </dd>
            </div>
          </dl>
        </div>

        {/* The Role Section */}
        <div className="mt-32 sm:mt-40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                        The Role: Door-to-Door Sales Rep
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <Target className="h-6 w-6 text-orange-600 shrink-0" />
                            <span className="text-gray-700">Generate leads and close sales for our premium exterior cleaning services.</span>
                        </li>
                        <li className="flex gap-3">
                            <Users className="h-6 w-6 text-orange-600 shrink-0" />
                            <span className="text-gray-700">Build relationships with homeowners in local neighborhoods.</span>
                        </li>
                        <li className="flex gap-3">
                            <Zap className="h-6 w-6 text-orange-600 shrink-0" />
                            <span className="text-gray-700">Represent the ExcelPro brand with professionalism and energy.</span>
                        </li>
                        <li className="flex gap-3">
                            <Star className="h-6 w-6 text-orange-600 shrink-0" />
                            <span className="text-gray-700">Use our dedicated Sales App to track progress and generate instant quotes.</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-gray-100 rounded-2xl p-8 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Who We Are Looking For</h3>
                    <div className="space-y-4 text-gray-600">
                        <p>✅ <strong>Go-Getters:</strong> You don't wait for things to happen; you make them happen.</p>
                        <p>✅ <strong>Resilient:</strong> You embrace "no" as one step closer to a "yes".</p>
                        <p>✅ <strong>Communicators:</strong> You love talking to people and making new connections.</p>
                        <p>✅ <strong>Experience:</strong> Sales experience is a plus, but <strong>drive is mandatory</strong>. We train the right attitude.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 rounded-3xl bg-orange-600 py-16 px-6 sm:px-16 lg:px-24 text-center shadow-xl sm:mx-auto sm:max-w-4xl">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Level Up?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-orange-100">
                We are filling only <span className="font-bold text-white underline decoration-white decoration-2 underline-offset-4">3 positions</span> this week. Don't miss your chance to join Ottawa's fastest-growing team.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <a
                    href="mailto:careers@excelprowashers.com?subject=Application for Sales Rep Position"
                    className="rounded-md bg-white px-6 py-3 text-base font-semibold text-orange-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                    Apply Now via Email
                </a>
            </div>
        </div>

      </div>
    </div>
  )
}
