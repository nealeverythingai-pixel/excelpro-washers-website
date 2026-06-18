import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArticleSchema, BreadcrumbSchema, FAQSchema } from '@/components/StructuredData'
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
  faqs?: { question: string; answer: string }[];
}> = {
  'best-window-cleaners-ottawa': {
    title: 'Why We Are The Best Window Cleaners in Ottawa (And Near You!)',
    date: '2024-03-20',
    category: 'Window Cleaning',
    keywords: ['Window Cleaners near me', 'Window Cleaners Ottawa', 'Professional Window Cleaning', 'Residential Window Cleaning'],
    description: 'Searching for "window cleaners near me" in Ottawa? ExcelPro Washers offers streak-free, reliable, and affordable window cleaning services for your home.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 dark:text-gray-300 mb-8 [&_strong]:text-gray-900 [&_strong]:dark:text-white">
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

        <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-8">
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">How much does window cleaning cost in Ottawa?</h3>
                <p>Residential window cleaning starts at $199 for interior and exterior cleaning. Final pricing depends on the number of windows, stories, and accessibility.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">How often should I get my windows cleaned?</h3>
                <p>Most Ottawa homeowners clean their windows twice a year—once in spring to remove winter salt and grime, and again in fall before the snow arrives.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Do you clean window screens and tracks?</h3>
                <p>Yes, every window cleaning includes screen and sill cleaning at no extra charge—we believe a clean window means the whole frame, not just the glass.</p>
            </div>
        </div>

        <p className="mb-4">
            Already have clean windows but need to tackle your siding or driveway too? Check out our guides on <Link href="/blog/soft-wash-vs-pressure-wash-ottawa" className="text-primary-600 font-semibold hover:underline">soft washing vs. pressure washing</Link> and our <Link href="/blog/pressure-washing-ottawa-guide" className="text-primary-600 font-semibold hover:underline">ultimate pressure washing guide</Link>.
        </p>

        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl border border-green-200 dark:border-green-700 my-8">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Ready for a Clear View of Ottawa?</h3>
            <p className="text-green-700 dark:text-green-400 mb-4">Don't let dirty windows ruin your curb appeal or block your beautiful view. Get a free, instant quote today and experience the ExcelPro difference.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Book Your Window Cleaning Now
            </Link>
        </div>
      </>
    ),
    faqs: [
      { question: 'How much does window cleaning cost in Ottawa?', answer: 'Residential window cleaning starts at $199 for interior and exterior cleaning. Final pricing depends on the number of windows, stories, and accessibility.' },
      { question: 'How often should I get my windows cleaned?', answer: 'Most Ottawa homeowners clean their windows twice a year—once in spring to remove winter salt and grime, and again in fall before the snow arrives.' },
      { question: 'Do you clean window screens and tracks?', answer: 'Yes, every window cleaning includes screen and sill cleaning at no extra charge.' },
    ],
  },
  'soft-wash-vs-pressure-wash-ottawa': {
    title: 'Soft Wash vs. Pressure Washing: What Ottawa Homes Need',
    date: '2024-03-18',
    category: 'Soft Wash',
    keywords: ['Soft Wash Ottawa', 'House Washing Ottawa', 'Soft washing', 'Siding cleaning'],
    description: 'Learn why Soft Wash is the safest method for cleaning your Ottawa home\'s siding and roof. Protect your investment with ExcelPro Washers.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 dark:text-gray-300 mb-8">
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

        <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-8">
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Is soft washing safe for vinyl siding?</h3>
                <p>Yes—soft washing is actually the recommended method for vinyl siding. The low-pressure approach prevents the cracking and water intrusion that high-pressure washing can cause.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">How long does a soft wash treatment last?</h3>
                <p>Because soft washing kills algae and mold at the root rather than just blasting it off the surface, results typically last 2-3 times longer than pressure washing alone.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Can soft washing be used on my roof too?</h3>
                <p>Absolutely. Soft washing is the only method we recommend for asphalt shingle roofs, as it removes black streaks and moss without stripping protective granules.</p>
            </div>
        </div>

        <p className="mb-4">
            Need to clean your hard surfaces too? Our <Link href="/blog/pressure-washing-ottawa-guide" className="text-primary-600 font-semibold hover:underline">pressure washing guide</Link> covers driveways and patios, or browse our <Link href="/blog/roof-soft-wash-ottawa" className="text-primary-600 font-semibold hover:underline">roof cleaning guide</Link> for more on moss and black streak removal.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-700 my-8">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Protect Your Siding Today</h3>
            <p className="text-green-700 dark:text-green-400 mb-4">Get a gentle, effective clean that restores your home's beauty without the risk of damage.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Get a Soft Wash Quote
            </Link>
        </div>
      </>
    ),
    faqs: [
      { question: 'Is soft washing safe for vinyl siding?', answer: 'Yes—soft washing is the recommended method for vinyl siding. The low-pressure approach prevents the cracking and water intrusion that high-pressure washing can cause.' },
      { question: 'How long does a soft wash treatment last?', answer: 'Because soft washing kills algae and mold at the root rather than just blasting it off the surface, results typically last 2-3 times longer than pressure washing alone.' },
      { question: 'Can soft washing be used on my roof too?', answer: 'Yes, soft washing is the recommended method for asphalt shingle roofs since it removes black streaks and moss without stripping protective granules.' },
    ],
  },
  'pressure-washing-ottawa-guide': {
    title: 'The Ultimate Guide to Pressure Washing in Ottawa',
    date: '2024-03-15',
    category: 'Pressure Washing',
    keywords: ['Pressure Washing Ottawa', 'Driveway Cleaning', 'Patio Cleaning', 'Power Washing'],
    description: 'Revive your Ottawa property with professional pressure washing. We clean driveways, decks, and patios to remove years of grime and salt.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 dark:text-gray-300 mb-8">
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

        <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-8">
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Will pressure washing damage my concrete or interlock?</h3>
                <p>Not when done correctly. Our technicians adjust PSI and use surface cleaners to avoid etching concrete or dislodging polymeric sand between pavers.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Can you remove oil stains from my driveway?</h3>
                <p>Yes—we pre-treat oil and grease stains with a degreaser before pressure washing, which lifts the majority of staining. Very old, deep-set stains may lighten significantly but not disappear completely.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">What's the best time of year to pressure wash in Ottawa?</h3>
                <p>Spring is ideal for removing winter salt and sand buildup, but pressure washing is effective any time the temperature is consistently above freezing.</p>
            </div>
        </div>

        <p className="mb-4">
            Looking to clean siding or your roof instead? Read our guide on <Link href="/blog/soft-wash-vs-pressure-wash-ottawa" className="text-primary-600 font-semibold hover:underline">soft wash vs. pressure wash</Link> to pick the right method, or check our <Link href="/blog/spring-cleaning-checklist-ottawa" className="text-primary-600 font-semibold hover:underline">seasonal cleaning checklist</Link> to plan your whole property.
        </p>

        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl border border-green-200 dark:border-green-700 my-8">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Boost Your Curb Appeal Today</h3>
            <p className="text-green-700 dark:text-green-400 mb-4">Bring your driveway and patio back to life. Fast, affordable, and effective. Starting at just $249.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Book Pressure Washing Now
            </Link>
        </div>
      </>
    ),
    faqs: [
      { question: 'Will pressure washing damage my concrete or interlock?', answer: 'Not when done correctly. Technicians adjust PSI and use surface cleaners to avoid etching concrete or dislodging polymeric sand between pavers.' },
      { question: 'Can you remove oil stains from my driveway?', answer: 'Yes—oil and grease stains are pre-treated with a degreaser before pressure washing, which lifts the majority of staining.' },
      { question: "What's the best time of year to pressure wash in Ottawa?", answer: 'Spring is ideal for removing winter salt and sand buildup, but pressure washing is effective any time the temperature is consistently above freezing.' },
    ],
  },
  'gutter-cleaning-ottawa': {
    title: 'Gutter Cleaning Ottawa: Why It Matters and What It Costs',
    date: '2025-10-14',
    category: 'Gutter Cleaning',
    keywords: ['Gutter Cleaning Ottawa', 'Gutter Cleaning near me', 'Downspout Cleaning', 'Eavestrough Cleaning Ottawa'],
    description: 'Clogged gutters cause foundation damage, ice dams, and roof leaks. Learn why Ottawa homeowners need professional gutter cleaning twice a year.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 dark:text-gray-300 mb-8">
            Clogged gutters are one of the most overlooked causes of expensive home damage in Ottawa. Falling leaves, seed pods, and winter debris build up fast, and once your gutters back up, water has nowhere to go but down your siding, into your foundation, or under your roofline.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Why Clogged Gutters Are Dangerous</h2>
        <p className="mb-4">
            A blocked gutter system isn't just an eyesore—it's a direct threat to your home's structure. Here's what we see most often on Ottawa service calls:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li><strong>Foundation Damage:</strong> Overflowing water pools around your foundation, leading to cracks and basement leaks.</li>
            <li><strong>Ice Dams:</strong> Standing water in clogged gutters freezes in Ottawa winters, forcing ice back under shingles and causing roof leaks.</li>
            <li><strong>Siding & Fascia Rot:</strong> Water spilling over gutter edges runs down siding and behind fascia boards, leading to wood rot and mold.</li>
            <li><strong>Pest Problems:</strong> Standing water and decaying leaves attract mosquitoes, rodents, and insects.</li>
            <li><strong>Landscape Erosion:</strong> Overflow can wash out flower beds and erode soil around your home.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">How Often Should Gutters Be Cleaned?</h2>
        <p className="mb-4">
            Most Ottawa homes need gutter cleaning <strong>twice a year</strong>—once in late spring after seed pods and winter debris have settled, and again in late fall after the leaves have dropped but before the first freeze. Homes surrounded by mature trees may need a third cleaning mid-summer.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Gutter Cleaning Process</h2>
        <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li><strong>Debris Removal:</strong> We hand-clear leaves, twigs, and sediment from the entire gutter run.</li>
            <li><strong>Downspout Flush:</strong> We flush each downspout with water to confirm it's draining freely and clear any hidden clogs.</li>
            <li><strong>Gutter Flush:</strong> A final water test confirms proper flow and pitch across the whole system.</li>
            <li><strong>Inspection:</strong> We check for loose brackets, rust spots, or sagging sections and report any concerns.</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8 mb-4">Pricing & Service Areas</h2>
        <p className="mb-4">
            Gutter cleaning starts at <strong>$175</strong> for a standard single-story home. We serve Ottawa, Kanata, Orleans, Barrhaven, Nepean, and Stittsville. Ask about bundling gutter cleaning with window cleaning or soft washing for a multi-service discount.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-8">
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">How do I know if my gutters need cleaning?</h3>
                <p>Visible plant growth, water spilling over the edge during rain, or sagging sections are all signs it's time for a cleaning.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Do you install gutter guards?</h3>
                <p>We focus on cleaning and inspection, but we're happy to recommend trusted gutter guard installers if your home is in a heavy tree-debris area.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Can clogged gutters affect my roof cleaning needs?</h3>
                <p>Yes—standing water in gutters often contributes to moss and algae growth along the roofline. Pairing gutter cleaning with a <Link href="/blog/roof-soft-wash-ottawa" className="text-primary-600 font-semibold hover:underline">roof soft wash</Link> tackles both issues at once.</p>
            </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl border border-green-200 dark:border-green-700 my-8">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Protect Your Home Before the Next Storm</h3>
            <p className="text-green-700 dark:text-green-400 mb-4">Don't wait for an overflow to cause damage. Get your gutters cleared by Ottawa's exterior cleaning experts.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Book Gutter Cleaning Now
            </Link>
        </div>
      </>
    ),
    faqs: [
      { question: 'How do I know if my gutters need cleaning?', answer: 'Visible plant growth, water spilling over the edge during rain, or sagging sections are all signs it\'s time for a cleaning.' },
      { question: 'Do you install gutter guards?', answer: 'We focus on cleaning and inspection, but can recommend trusted gutter guard installers for homes in heavy tree-debris areas.' },
      { question: 'Can clogged gutters affect my roof cleaning needs?', answer: 'Yes, standing water in gutters often contributes to moss and algae growth along the roofline. Pairing gutter cleaning with a roof soft wash tackles both issues at once.' },
    ],
  },
  'roof-soft-wash-ottawa': {
    title: 'Roof Cleaning Ottawa: How Soft Washing Removes Black Streaks & Moss',
    date: '2025-11-18',
    category: 'Soft Wash',
    keywords: ['Roof Cleaning Ottawa', 'Roof Soft Wash', 'Black Streak Removal', 'Moss Removal Roof'],
    description: 'Those black streaks on your roof are algae, not dirt. Learn how professional soft washing removes them safely and extends your shingles\' lifespan.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 dark:text-gray-300 mb-8">
            If you've noticed dark streaks running down your asphalt shingles, that's not just dirt—it's <strong>gloeocapsa magma</strong>, a algae that feeds on the limestone filler in shingles. Left untreated, it spreads and can shorten your roof's lifespan by years.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Why You Should Never Pressure Wash a Roof</h2>
        <p className="mb-4">
            High-pressure water blasted directly at asphalt shingles strips away the protective granules that shield them from UV damage. Once granules are gone, they don't grow back—you've effectively aged your roof by years in a single afternoon. This is why every reputable roofing manufacturer recommends soft washing, not pressure washing, for roof cleaning.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">How Roof Soft Washing Works</h2>
        <p className="mb-4">
            We apply a biodegradable, low-pressure cleaning solution from the ground or roof edge using specialized equipment. The solution breaks down algae, moss, and lichen at the root, and rinses away gently—no scrubbing, no high-pressure spray, no granule loss.
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li><strong>Black Streak Removal:</strong> Algae stains lift away, restoring your roof's original color.</li>
            <li><strong>Moss & Lichen Treatment:</strong> Our solution kills moss at the root so it doesn't grow back as quickly as a manual scrape would allow.</li>
            <li><strong>Gutter Protection:</strong> We rinse debris away from gutter openings as part of the process.</li>
            <li><strong>Curb Appeal:</strong> A clean roof is one of the fastest ways to improve how your whole home looks from the street.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Signs Your Roof Needs Cleaning</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Dark streaks running vertically down the shingles</li>
            <li>Green or black patches in shaded areas, especially north-facing slopes</li>
            <li>Moss growing along the roofline or in valleys</li>
            <li>Visible granule buildup in gutters or downspouts</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Pricing & Service Areas</h2>
        <p className="mb-4">
            Roof soft washing starts at <strong>$450</strong> depending on roof size and pitch. We serve Ottawa, Kanata, Orleans, Barrhaven, Nepean, and surrounding areas. Bundle with gutter cleaning for the best results and a multi-service discount.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-8">
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Is roof soft washing safe for my plants and landscaping?</h3>
                <p>Yes, our solutions are biodegradable and we take care to pre-rinse and protect surrounding plants and grass during application.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">How long do roof soft wash results last?</h3>
                <p>Most homes stay streak-free for 2-4 years, much longer than the algae regrowth you'd see after a manual scrub or pressure wash.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Does soft washing work on metal or cedar roofs?</h3>
                <p>Yes, soft washing is gentle enough for metal, cedar shake, and tile roofs in addition to standard asphalt shingles.</p>
            </div>
        </div>

        <p className="mb-4">
            Want the full picture on safe cleaning methods? Read our <Link href="/blog/soft-wash-vs-pressure-wash-ottawa" className="text-primary-600 font-semibold hover:underline">soft wash vs. pressure wash guide</Link> or check out our <Link href="/blog/gutter-cleaning-ottawa" className="text-primary-600 font-semibold hover:underline">gutter cleaning guide</Link> to protect your whole roofline.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-700 my-8">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Restore Your Roof's Curb Appeal</h3>
            <p className="text-green-700 dark:text-green-400 mb-4">Remove black streaks and moss safely—without risking your shingles.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Get a Roof Cleaning Quote
            </Link>
        </div>
      </>
    ),
    faqs: [
      { question: 'Is roof soft washing safe for my plants and landscaping?', answer: 'Yes, the solutions used are biodegradable and surrounding plants and grass are protected during application.' },
      { question: 'How long do roof soft wash results last?', answer: 'Most homes stay streak-free for 2-4 years, much longer than the regrowth seen after a manual scrub or pressure wash.' },
      { question: 'Does soft washing work on metal or cedar roofs?', answer: 'Yes, soft washing is gentle enough for metal, cedar shake, and tile roofs in addition to standard asphalt shingles.' },
    ],
  },
  'spring-cleaning-checklist-ottawa': {
    title: 'The Ultimate Spring Exterior Cleaning Checklist for Ottawa Homeowners',
    date: '2026-02-09',
    category: 'Home Maintenance',
    keywords: ['Spring Cleaning Checklist Ottawa', 'Exterior Home Maintenance', 'Spring Home Cleaning', 'Ottawa Home Care'],
    description: 'After a long Ottawa winter, your home needs a full exterior reset. Use this room-by-room checklist to tackle salt, grime, and winter damage this spring.',
    content: (
      <>
        <p className="lead text-xl text-gray-700 dark:text-gray-300 mb-8">
            Ottawa winters are tough on homes. By the time the snow melts, your windows, siding, driveway, and gutters are coated in months of road salt, sand, and grime. Here's the exterior cleaning checklist our team runs through every spring.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Gutters & Downspouts</h2>
        <p className="mb-4">
            Start at the top. Winter ice and debris clog gutters fast, and a backed-up system can cause water damage the moment spring rain hits. See our full <Link href="/blog/gutter-cleaning-ottawa" className="text-primary-600 font-semibold hover:underline">gutter cleaning guide</Link> for what to check.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. Roof Inspection & Cleaning</h2>
        <p className="mb-4">
            Look for black streaks, moss, or missing granules in your gutters. If you spot algae streaks, a <Link href="/blog/roof-soft-wash-ottawa" className="text-primary-600 font-semibold hover:underline">roof soft wash</Link> now prevents bigger problems before summer humidity accelerates growth.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Windows, Screens & Sills</h2>
        <p className="mb-4">
            Road salt spray and winter grime build up on glass and tracks. A full interior and exterior <Link href="/blog/best-window-cleaners-ottawa" className="text-primary-600 font-semibold hover:underline">window cleaning</Link> lets more natural light in and gives you a clear look at any winter damage to frames or screens.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Siding Soft Wash</h2>
        <p className="mb-4">
            Vinyl and stucco siding collect mold, mildew, and pollen over winter and into spring. A gentle <Link href="/blog/soft-wash-vs-pressure-wash-ottawa" className="text-primary-600 font-semibold hover:underline">soft wash</Link> removes growth without the damage risk of high-pressure water.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Driveways, Walkways & Patios</h2>
        <p className="mb-4">
            Salt stains and sand buildup are the biggest spring eyesore on Ottawa driveways. Our <Link href="/blog/pressure-washing-ottawa-guide" className="text-primary-600 font-semibold hover:underline">pressure washing guide</Link> covers how we restore concrete, interlock, and wood surfaces before patio season.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">A Suggested Spring Order of Operations</h2>
        <ol className="list-decimal pl-6 mb-6 space-y-2">
            <li>Gutter cleaning (clears the path for everything below)</li>
            <li>Roof soft wash</li>
            <li>Siding soft wash</li>
            <li>Window cleaning</li>
            <li>Driveway and patio pressure washing</li>
        </ol>
        <p className="mb-4">
            Working top to bottom means runoff from higher cleaning jobs doesn't undo work you've already finished lower down.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-8">
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">What's the best month to do spring exterior cleaning in Ottawa?</h3>
                <p>Late April through May is ideal—after the last snowmelt but before pollen season peaks.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Can I bundle multiple services to save money?</h3>
                <p>Yes, most Ottawa homeowners bundle gutter cleaning, soft washing, and window cleaning into one visit for a multi-service discount.</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Do I need to do all of this every spring?</h3>
                <p>Gutters and windows benefit from a spring cleaning every year. Roof and siding soft washing typically only need attention every 2-4 years unless you have heavy tree cover.</p>
            </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-xl border border-green-200 dark:border-green-700 my-8">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Get Your Home Spring-Ready</h3>
            <p className="text-green-700 dark:text-green-400 mb-4">Book a full exterior cleaning package and let us handle your entire checklist in one visit.</p>
            <Link href="/contact" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Book Your Spring Cleaning
            </Link>
        </div>
      </>
    ),
    faqs: [
      { question: "What's the best month to do spring exterior cleaning in Ottawa?", answer: 'Late April through May is ideal—after the last snowmelt but before pollen season peaks.' },
      { question: 'Can I bundle multiple services to save money?', answer: 'Yes, most homeowners bundle gutter cleaning, soft washing, and window cleaning into one visit for a multi-service discount.' },
      { question: 'Do I need to do all of this every spring?', answer: 'Gutters and windows benefit from a spring cleaning every year. Roof and siding soft washing typically only need attention every 2-4 years unless you have heavy tree cover.' },
    ],
  },
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug]
  if (!post) return { title: 'Post Not Found' }

  const url = `${siteConfig.url}/blog/${slug}`;
  const imageUrl = post.image || siteConfig.ogImage;

  return {
    title: `${post.title} | ExcelPro Washers Ottawa`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: siteConfig.name }],
    alternates: {
      canonical: `/blog/${slug}`,
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

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug]

  if (!post) {
    notFound()
  }

  const postUrl = `${siteConfig.url}/blog/${slug}`;
  const breadcrumbItems = [
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${slug}` },
  ];

  const relatedPosts = Object.entries(posts)
    .filter(([otherSlug]) => otherSlug !== slug)
    .slice(0, 3);

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
      {post.faqs && <FAQSchema items={post.faqs} />}
      
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

          {relatedPosts.length > 0 && (
            <section className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedPosts.map(([relatedSlug, relatedPost]) => (
                  <Link
                    key={relatedSlug}
                    href={`/blog/${relatedSlug}`}
                    className="block rounded-xl bg-gray-50 dark:bg-gray-800 p-4 hover:shadow-md transition-shadow"
                  >
                    <span className="text-xs font-medium text-primary-600">{relatedPost.category}</span>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                      {relatedPost.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

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
