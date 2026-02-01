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
        <p className="lead text-xl text-gray-700 dark:text-gray-300 mb-8">
            If you've been searching for <strong>"window cleaners near me"</strong> or <strong>"best window cleaners in Ottawa"</strong>, you're probably tired of looking through dirty, streaky windows. Living in Ottawa means dealing with harsh winters, muddy springs, and humid summers—all of which wreak havoc on your glass surfaces.
        </p>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Why Choose a Local Ottawa Window Cleaner?</h2>
        <p className="mb-4">
            When you hire a local service like ExcelPro Washers, you aren't just getting clean glass; you're getting a team that understands Ottawa's unique climate challenges. We know how road salt, pollen, dust, and winter grime stick to Ottawa homes throughout the year. Our professional squeegee techniques and eco-friendly solutions ensure a streak-free shine that lasts longer than a DIY garden hose spray.
        </p>

        <p className="mb-4">
            With over <strong>500+ completed jobs</strong> and a <strong>4.9-star rating</strong>, we've become Ottawa's most trusted window cleaning service. Our team is fully insured with $2M liability coverage, giving you complete peace of mind.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Professional Window Cleaning Process</h2>
        <p className="mb-4">We don't just wipe your windows—we provide a comprehensive cleaning service that addresses every detail:</p>
        
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li><strong>Exterior Cleaning:</strong> We carefully remove screens and scrub the glass with purified water or professional-grade solution to eliminate grime, hard water stains, and mineral deposits.</li>
            <li><strong>Interior Cleaning:</strong> We use drop cloths to protect your floors and furniture, ensuring zero drips inside your home. Our microfiber cloths leave no lint behind.</li>
            <li><strong>Screen & Sill Cleaning:</strong> A window isn't truly clean if the tracks are dirty. We meticulously wipe down sills, frames, and clean screens to remove cobwebs and debris.</li>
            <li><strong>Hard Water Stain Removal:</strong> We use specialized solutions to remove tough calcium and mineral deposits that regular cleaning can't touch.</li>
            <li><strong>Quality Inspection:</strong> Before we leave, we inspect every window to ensure perfect, streak-free results.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Residential & Commercial Window Cleaning Services</h2>
        <p className="mb-4">
            Whether you own a townhouse in Kanata, a bungalow in Nepean, a condo in downtown Ottawa, or a storefront in the ByWard Market, our team is equipped to handle it all. We specialize in:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Single-family homes and townhouses</li>
            <li>Multi-story buildings (up to 3 stories with specialized equipment)</li>
            <li>Condominiums and apartment buildings</li>
            <li>Retail storefronts and office buildings</li>
            <li>Post-construction cleaning</li>
            <li>Move-in/move-out cleaning services</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Why Professional Window Cleaning Matters</h2>
        <p className="mb-4">
            Many homeowners underestimate the value of clean windows. Beyond aesthetics, professional window cleaning:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Extends Window Lifespan:</strong> Regular cleaning prevents mineral buildup and oxidation that can etch glass permanently.</li>
            <li><strong>Improves Energy Efficiency:</strong> Clean windows allow more natural light in, reducing the need for artificial lighting.</li>
            <li><strong>Enhances Curb Appeal:</strong> Clean windows can increase your home's value by up to 10% according to real estate experts.</li>
            <li><strong>Healthier Living:</strong> Removing dust, pollen, and allergens from window surfaces improves indoor air quality.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">What Our Ottawa Customers Say</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl my-6">
            <p className="italic mb-2">"ExcelPro Washers transformed our home! After a brutal Ottawa winter, our windows were covered in salt and grime. They came out the same day I called and made them look brand new. Highly recommend!"</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">— Sarah M., Kanata</p>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Service Areas Across Ottawa</h2>
        <p className="mb-4">We proudly serve all of Ottawa and surrounding areas, including:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-primary-50 dark:bg-primary-900 p-3 rounded-lg text-center">Kanata</div>
            <div className="bg-primary-50 dark:bg-primary-900 p-3 rounded-lg text-center">Orleans</div>
            <div className="bg-primary-50 dark:bg-primary-900 p-3 rounded-lg text-center">Barrhaven</div>
            <div className="bg-primary-50 dark:bg-primary-900 p-3 rounded-lg text-center">Nepean</div>
            <div className="bg-primary-50 dark:bg-primary-900 p-3 rounded-lg text-center">Stittsville</div>
            <div className="bg-primary-50 dark:bg-primary-900 p-3 rounded-lg text-center">Manotick</div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Pricing: Transparent & Affordable</h2>
        <p className="mb-4">
            We believe in upfront, honest pricing. Our residential window cleaning starts at just <strong>$199</strong>, which includes interior and exterior cleaning. We offer free quotes with no obligation—simply call us at <strong>(343) 321-5300</strong> or fill out our online form.
        </p>

        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl border border-green-200 dark:border-green-700 my-8">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Ready for a Clear View of Ottawa?</h3>
            <p className="text-green-700 dark:text-green-400 mb-4">Don't let dirty windows ruin your curb appeal or block your beautiful view. Get a free, instant quote today and experience the ExcelPro difference.</p>
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
            Unlike our Soft Wash service for delicate vertical surfaces, our high-power pressure washing (up to 3500 PSI) is perfect for durable horizontal surfaces:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li><strong>Concrete Driveways:</strong> Remove tire marks, oil stains, salt residue, and years of embedded dirt.</li>
            <li><strong>Interlock & Pavers:</strong> Clean out weeds, moss, and algae from between stones, restoring original color.</li>
            <li><strong>Wooden Decks & Fences:</strong> Prepare wood for staining or remove grey oxidation and mildew.</li>
            <li><strong>Patios & Walkways:</strong> Get your backyard ready for BBQ season—remove winter grime and slippery algae.</li>
            <li><strong>Garage Floors:</strong> Deep clean oil stains and tire marks from concrete surfaces.</li>
            <li><strong>Commercial Surfaces:</strong> Parking lots, loading docks, and storefronts.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Why Hire a Professional Pressure Washing Service?</h2>
        <p className="mb-4">
            Consumer-grade pressure washers (1300-2000 PSI) often lack the GPM (Gallons Per Minute) flow rate to clean effectively without leaving "zebra stripes" (streak marks). Here's why professional equipment matters:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Industrial Power:</strong> Our 3500 PSI, 4.0 GPM machines clean 3-4x faster than consumer units.</li>
            <li><strong>Hot Water Option:</strong> For oil stains and heavy grease, hot water breaks down contaminants better.</li>
            <li><strong>Surface Cleaners:</strong> These attachments prevent streaking and ensure uniform cleaning on flat surfaces.</li>
            <li><strong>Proper Technique:</strong> Incorrect pressure or angle can etch concrete or damage surfaces permanently.</li>
            <li><strong>Time Savings:</strong> A professional driveway clean takes 1-2 hours vs. 6-8 hours DIY.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Ottawa's Winter Aftermath: Salt & Sand Removal</h2>
        <p className="mb-4">
            After Ottawa's brutal winters, your driveway and walkways are coated in salt, sand, and de-icing chemicals. These contaminants:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Deteriorate concrete and interlock surfaces over time</li>
            <li>Leave white calcium deposits that are difficult to remove</li>
            <li>Get tracked into your home, damaging floors and carpets</li>
            <li>Create slippery, unsafe surfaces when wet</li>
        </ul>
        <p className="mb-4">
            Spring pressure washing isn't just cosmetic—it's maintenance that extends the life of your hardscaping by years.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Pressure Washing Process</h2>
        <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li><strong>Pre-Inspection:</strong> We assess surface condition and identify stains requiring special treatment.</li>
            <li><strong>Pre-Treatment:</strong> Oil and grease stains get degreaser application before washing.</li>
            <li><strong>High-Pressure Cleaning:</strong> We use surface cleaners for uniform coverage on flat areas.</li>
            <li><strong>Detail Work:</strong> Edges and corners are cleaned with wand for precision.</li>
            <li><strong>Post-Treatment:</strong> For stubborn stains, we apply additional treatments and re-clean.</li>
            <li><strong>Inspection & Touch-Ups:</strong> We review results with you and address any missed spots.</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8 mb-4">Pricing & Service Areas</h2>
        <p className="mb-4">
            Our pressure washing starts at <strong>$249</strong> for a standard driveway (up to 400 sq ft). We serve all of Ottawa including Kanata, Orleans, Barrhaven, Nepean, Stittsville, and surrounding areas. Contact us for a free, no-obligation quote.
        </p>

        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl border border-green-200 dark:border-green-700 my-8">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Boost Your Curb Appeal Today</h3>
            <p className="text-green-700 dark:text-green-400 mb-4">Bring your driveway and patio back to life. Fast, affordable, and effective. Starting at just $249.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Book Pressure Washing Now
            </Link>
        </div>
      </>
    )
  }
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({
    slug: slug,
  }));
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
