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
    slug: 'window-cleaning-kanata',
    title: 'Window Cleaning in Kanata: A Local Guide for Homeowners',
    excerpt: 'Looking for reliable window cleaners in Kanata? Here\'s what Kanata homeowners should know about scheduling, pricing, and what to expect.',
    date: '2026-05-20',
    category: 'Window Cleaning'
  },
  {
    slug: 'post-construction-cleaning-ottawa',
    title: 'Post-Construction Window Cleaning in Ottawa: What to Expect',
    excerpt: 'New windows are often covered in stickers, paint overspray, and construction dust. Here\'s how professional post-construction window cleaning gets them move-in ready.',
    date: '2026-04-25',
    category: 'Window Cleaning'
  },
  {
    slug: 'commercial-window-cleaning-ottawa',
    title: 'Commercial Window Cleaning in Ottawa: What Business Owners Should Know',
    excerpt: 'Clean storefronts and office windows make a real first impression. Here\'s what Ottawa business owners should expect from a commercial window cleaning service.',
    date: '2026-04-02',
    category: 'Window Cleaning'
  },
  {
    slug: 'deck-cleaning-ottawa',
    title: 'Deck Cleaning Ottawa: How to Prep Wood Decks for Staining',
    excerpt: 'Grey, weathered decks need more than a quick rinse before staining. Learn how professional deck cleaning restores wood and helps stain last longer.',
    date: '2026-03-12',
    category: 'Pressure Washing'
  },
  {
    slug: 'spring-cleaning-checklist-ottawa',
    title: 'The Ultimate Spring Exterior Cleaning Checklist for Ottawa Homeowners',
    excerpt: 'After a long Ottawa winter, your home needs a full exterior reset. Use this room-by-room checklist to tackle salt, grime, and winter damage this spring.',
    date: '2026-02-09',
    category: 'Home Maintenance'
  },
  {
    slug: 'roof-soft-wash-ottawa',
    title: 'Roof Cleaning Ottawa: How Soft Washing Removes Black Streaks & Moss',
    excerpt: 'Those black streaks on your roof are algae, not dirt. Learn how professional soft washing removes them safely and extends your shingles\' lifespan.',
    date: '2025-11-18',
    category: 'Soft Wash'
  },
  {
    slug: 'gutter-cleaning-ottawa',
    title: 'Gutter Cleaning Ottawa: Why It Matters and What It Costs',
    excerpt: 'Clogged gutters cause foundation damage, ice dams, and roof leaks. Learn why Ottawa homeowners need professional gutter cleaning twice a year.',
    date: '2025-10-14',
    category: 'Gutter Cleaning'
  },
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
