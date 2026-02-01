import { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/lib/site'
import { Shield, Award, Users, Clock, CheckCircle, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About ExcelPro Washers | Ottawa\'s Top-Rated Exterior Cleaning Company',
  description: 'Learn about ExcelPro Washers, Ottawa\'s premier window cleaning and pressure washing company. 500+ jobs completed, 4.9-star rating, fully insured with $2M coverage.',
  keywords: [
    'about ExcelPro Washers',
    'Ottawa cleaning company',
    'professional window cleaners',
    'licensed pressure washing',
    'insured cleaning services',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About ExcelPro Washers | Ottawa\'s Trusted Exterior Cleaning Experts',
    description: '500+ jobs completed. 4.9-star rating. $2M insured. Learn why Ottawa homeowners trust ExcelPro Washers.',
    type: 'website',
    url: `${siteConfig.url}/about`,
  },
}

export default function AboutPage() {
  return (
    <main className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              About ExcelPro Washers
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Ottawa's most trusted exterior cleaning company. Professional window cleaning, pressure washing, and soft wash services since 2020.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-50 dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">4.9/5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Star Rating</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">$2M</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Insurance</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">Same-Day</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Our Story</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              ExcelPro Washers was founded in 2020 with a simple mission: to provide Ottawa homeowners and businesses with the highest quality exterior cleaning services. We saw too many companies cutting corners, using harsh chemicals, or damaging property with improper techniques.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Today, we're proud to be Ottawa's top-rated exterior cleaning company, with over 500 satisfied customers and a 4.9-star rating. Our success comes from our commitment to quality, safety, and customer satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
            Why Ottawa Trusts ExcelPro Washers
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Fully Insured & Bonded</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We carry $2M liability insurance for your complete peace of mind. Your property is fully protected.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Professional Equipment</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We use commercial-grade equipment and eco-friendly cleaning solutions for superior results.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trained Technicians</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Our team is trained in the latest cleaning techniques and safety protocols.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Satisfaction Guarantee</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Not happy? We'll make it right. 100% satisfaction guaranteed on every job.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Local & Reliable</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We're a local Ottawa company that understands our climate and your needs.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Year-Round Service</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                We provide services year-round, including winter window cleaning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
            Proudly Serving Ottawa & Surrounding Areas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Ottawa</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Kanata</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Orleans</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Barrhaven</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Nepean</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Stittsville</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Manotick</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Gloucester</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">Vanier</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 dark:bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-200">Get your free quote today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                Get Free Quote
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href={`tel:${siteConfig.business.phone}`}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
