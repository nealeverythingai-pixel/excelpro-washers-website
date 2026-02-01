import { Metadata } from 'next'
import { BlogList } from './BlogList'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Window Cleaning & Pressure Washing Blog | Ottawa Tips - ExcelPro Washers',
  description: 'Expert advice on window cleaning, pressure washing, soft washing, and home maintenance in Ottawa. Read our latest guides and tips from professional cleaners.',
  keywords: [
    'window cleaning blog',
    'pressure washing tips',
    'Ottawa home maintenance',
    'soft washing guide',
    'cleaning advice Ottawa',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Window Cleaning & Pressure Washing Blog | ExcelPro Washers',
    description: 'Expert cleaning advice and tips for Ottawa homeowners. Learn from the pros.',
    type: 'website',
    url: `${siteConfig.url}/blog`,
  },
}

const blogs = [
  {
    slug: 'best-window-cleaners-ottawa',
    title: 'Why We Are The Best Window Cleaners in Ottawa (And Near You!)',
    excerpt: 'Looking for "window cleaners near me"? Discover why Ottawa homeowners trust ExcelPro Washers for sparkling, streak-free windows year-round.',
    date: '2024-03-20',
    category: 'Window Cleaning'
  },
  {
    slug: 'soft-wash-vs-pressure-wash-ottawa',
    title: 'Soft Wash vs. Pressure Washing: What Ottawa Homes Need',
    excerpt: 'Understanding the difference between soft washing and pressure washing is crucial for protecting your siding and roof in Ottawa\'s climate.',
    date: '2024-03-18',
    category: 'Soft Wash'
  },
  {
    slug: 'pressure-washing-ottawa-guide',
    title: 'The Ultimate Guide to Pressure Washing in Ottawa',
    excerpt: 'Revitalize your driveway, deck, and patio. Learn how professional pressure washing adds curb appeal and value to your Ottawa property.',
    date: '2024-03-15',
    category: 'Pressure Washing'
  }
]

export default function BlogPage() {
  return (
    <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Expert Cleaning Tips for Ottawa Homes</h1>
          <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Learn about window cleaning, soft washing, and property maintenance from Ottawa's top professionals. Free guides and expert advice.
          </p>
        </div>
        <BlogList posts={blogs} />
      </div>
    </div>
  )
}
