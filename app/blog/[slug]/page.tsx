import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArticleSchema, BreadcrumbSchema } from '@/components/StructuredData'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { siteConfig } from '@/lib/site'

// We'll define the content directly here for simplicity and SEO control
// In a larger app, this would come from a CMS or markdown files
const posts: Record<string, {
  title: string;
  date: string;
  category: string;
  content: React.ReactNode;
  keywords: string[];
  description: string;
  image?: string;
}> = {
  'best-window-cleaners-ottawa': {
    title: 'Why We Are The Best Window Cleaners in Ottawa (And Near You!)',
    date: '2024-03-20',
    category: 'Window Cleaning',
    keywords: ['Window Cleaners near me', 'Window Cleaners Ottawa', 'Professional Window Cleaning', 'Residential Window Cleaning'],
    description: 'Searching for "window cleaners near me" in Ottawa? ExcelPro Washers offers streak-free, reliable, and affordable window cleaning services for your home.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 mb-8">
            If you have been searching for <strong>"window cleaners near me"</strong> or <strong>"best window cleaners in Ottawa"</strong>, you likely have dirty windows blocking your view of our beautiful capital city. Living in Ottawa means dealing with harsh winters, muddy springs, and humid summers—all of which wreak havoc on your glass.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose a Local Ottawa Window Cleaner?</h2>
        <p className="mb-4">
            When you hire a local service like ExcelPro Washers, you aren't just getting clean glass; you are getting a team that understands local conditions. We know how road salt, pollen, and dust sticky to Ottawa homes. Our professional squeegee techniques and eco-friendly solutions ensure a streak-free shine that lasts longer than a DIY garden hose spray.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Window Cleaning Process</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Exterior Cleaning:</strong> We remove screens and scrub the glass with purified water or professional solution to remove grime.</li>
            <li><strong>Interior Cleaning:</strong> We use drop cloths to protect your floors and ensure zero drips inside your home.</li>
            <li><strong>Screen & Sill Cleaning:</strong> A window isn't clean if the tracks are dirty. We wipe down sills and frames.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Residential & Commercial Services</h2>
        <p className="mb-4">
            Whether you own a townhouse in Kanata, a bungalow in Nepean, or a storefront in the ByWard Market, our team is equipped to handle it. We are fully insured and safety-conscious.
        </p>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100 my-8">
            <h3 className="text-xl font-bold text-green-800 mb-2">Ready for a Clear View?</h3>
            <p className="text-green-700 mb-4">Don't let dirty windows ruin your curb appeal. Get a free, instant quote today.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Book Your Window Cleaning Now
            </Link>
        </div>
      </>
    )
  },
  'soft-wash-vs-pressure-wash-ottawa': {
    title: 'Soft Wash vs. Pressure Washing: What Ottawa Homes Need',
    date: '2024-03-18',
    category: 'Soft Wash',
    keywords: ['Soft Wash Ottawa', 'House Washing Ottawa', 'Soft washing', 'Siding cleaning'],
    description: 'Learn why Soft Wash is the safest method for cleaning your Ottawa home\'s siding and roof. Protect your investment with ExcelPro Washers.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 mb-8">
            Homeowners often ask us: "Should I pressure wash my house?" The answer is often <strong>NO</strong>—you should <strong>Soft Wash</strong> it. At ExcelPro Washers, we specialize in <strong>Soft Wash services in Ottawa</strong> to safely clean delicate surfaces.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">What is Soft Washing?</h2>
        <p className="mb-4">
            Soft washing is a cleaning method that uses low pressure and specialized solutions (typically distinct from high-pressure water) to safely remove mildew, bacteria, algae, and other organic stains from your home’s exterior. It is distinct from pressure washing, which relies on the force of water.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Why High Pressure is Bad for Siding</h2>
        <p className="mb-4">
            Using high-pressure water on vinyl siding, stucco, or asphalt shingles can verify damage them by:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Forcing water behind the siding (leading to mold).</li>
            <li>Stripping granules off roof shingles.</li>
            <li>Cracking brittle vinyl in colder weather.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">The Ottawa Soft Wash Advantage</h2>
        <p className="mb-4">
            Our Soft Wash system applies a biodegradable cleaning solution that kills the algae and mold at the root, keeping your home cleaner for longer. It's safe for your plants and pets when handled by professionals.
        </p>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100 my-8">
            <h3 className="text-xl font-bold text-green-800 mb-2">Protect Your Siding Today</h3>
            <p className="text-green-700 mb-4">Get a gentle, effective clean that restores your home's beauty without the risk of damage.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Get a Soft Wash Quote
            </Link>
        </div>
      </>
    )
  },
  'pressure-washing-ottawa-guide': {
    title: 'The Ultimate Guide to Pressure Washing in Ottawa',
    date: '2024-03-15',
    category: 'Pressure Washing',
    keywords: ['Pressure Washing Ottawa', 'Driveway Cleaning', 'Patio Cleaning', 'Power Washing'],
    description: 'Revive your Ottawa property with professional pressure washing. We clean driveways, decks, and patios to remove years of grime and salt.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 mb-8">
            Winter in Ottawa leaves behind a mess of salt, sand, and grime on your driveways and walkways. <strong>Pressure washing</strong> is the most effective way to blast away deep-seated dirt and restore the look of your hardscapes.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">What Can We Pressure Wash?</h2>
        <p className="mb-4">
            Unlike our Soft Wash service for delicate vertical surfaces, our high-power pressure washing is perfect for durable horizontal surfaces:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Concrete Driveways:</strong> Remove tire marks, oil stains, and salt residue.</li>
            <li><strong>Interlock & Pavers:</strong> Clean out weeds and moss from between stones.</li>
            <li><strong>Wooden Decks & Fences:</strong> Prepare wood for staining or simply remove grey oxidation.</li>
            <li><strong>Patios:</strong> Get your backyard ready for BBQ season.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Why Hire a Professional?</h2>
        <p className="mb-4">
            Consumer-grade pressure washers often lack the GPM (Gallons Per Minute) flow rate to clean effectively without leaving "zebra stripes" (streak marks). Our industrial-grade equipment ensures a uniform, deep clean in a fraction of the time.
        </p>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100 my-8">
            <h3 className="text-xl font-bold text-green-800 mb-2">Boost Your Curb Appeal</h3>
            <p className="text-green-700 mb-4">Bring your driveway and patio back to life. Fast, affordable, and effective.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Book Pressure Washing
            </Link>
        </div>
      </>
    )
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = posts[params.slug]
  if (!post) return { title: 'Post Not Found' }

  const url = `${siteConfig.url}/blog/${params.slug}`;
  const imageUrl = post.image || siteConfig.ogImage;

  return {
    title: `${post.title} | ExcelPro Washers Ottawa`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: siteConfig.name }],
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      type: 'article',
      url: url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [siteConfig.name],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [imageUrl],
      creator: '@excelprowashers',
    },
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]

  if (!post) {
    notFound()
  }

  const postUrl = `${siteConfig.url}/blog/${params.slug}`;
  const breadcrumbItems = [
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${params.slug}` },
  ];

  return (
    <>
      <ArticleSchema
        title={post.title}
        description={post.description}
        datePublished={post.date}
        url={postUrl}
        image={post.image || siteConfig.ogImage}
      />
      <BreadcrumbSchema 
        items={[
          { name: 'Home', url: siteConfig.url },
          { name: 'Blog', url: `${siteConfig.url}/blog` },
          { name: post.title, url: postUrl },
        ]} 
      />
      
      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <article className="mx-auto max-w-3xl px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} />
          
          <header className="mx-auto max-w-2xl text-center mb-16">
            <div className="flex items-center justify-center gap-x-4 text-xs mb-4">
              <time dateTime={post.date} className="text-gray-500 dark:text-gray-400">
                {new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </time>
              <span className="rounded-full bg-green-50 dark:bg-green-900 px-3 py-1.5 font-medium text-green-600 dark:text-green-400">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">{post.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">{post.description}</p>
          </header>
          
          <div className="prose prose-lg prose-green dark:prose-invert mx-auto text-gray-600 dark:text-gray-300">
            {post.content}
          </div>

          <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need Professional Cleaning Services?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Get a free quote from Ottawa's top-rated exterior cleaning experts.</p>
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Get Free Quote <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </footer>
        </article>
      </div>
    </>
  );
}
    </div>
  )
}
