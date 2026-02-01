import { Metadata } from "next";
import { ServiceCard } from "@/components/ServiceCard";
import { CTA } from "@/components/CTA";
import { siteConfig } from "@/lib/site";
import { PricingCalculator } from "@/components/PricingCalculator";
import { ServiceSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Professional Cleaning Services in Ottawa | Window, Pressure & Soft Wash",
  description: "Expert window cleaning, soft wash, pressure washing, and gutter cleaning services in Ottawa. Residential & commercial. Fully insured. Free quotes. Call (343) 321-5300.",
  keywords: [
    "window cleaning services Ottawa",
    "pressure washing Ottawa",
    "soft wash services",
    "gutter cleaning Ottawa",
    "commercial cleaning services",
    "residential exterior cleaning"
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Professional Cleaning Services in Ottawa | ExcelPro Washers",
    description: "Expert window cleaning, soft wash, pressure washing, and gutter cleaning. Serving Ottawa with 5-star rated service.",
    type: "website",
    url: "https://excelprowashers.com/services",
  },
};

export default function ServicesPage() {
  const services = [
    {
      title: "Window Cleaning",
      description: "Our signature service. We use purified water technology and traditional squeegee methods to ensure your windows are spotless, streak-free, and shining.",
      price: "From $199",
      features: [
        "Interior & Exterior Cleaning",
        "Screen & Track Cleaning",
        "Sills & Frames Wiped",
        "Streak-Free Guarantee",
        "Hard Water Stain Removal",
      ],
    },
    {
      title: "Soft Wash House Washing",
      description: "Restore your home's curb appeal safely. Our low-pressure soft wash method removes organic growth like mold, algae, and mildew without damaging your siding.",
      price: "From $299",
      features: [
        "Safe for Vinyl, Stucco & Wood",
        "Kills Algae & Mildew at the Root",
        "Prevents Property Damage",
        "Eco-Friendly Solutions",
        "Longer Lasting Clean",
      ],
    },
    {
      title: "Gutter Cleaning",
      description: "Protect your foundation from water damage. We remove debris, flush downspouts, and ensure your water drainage system is flowing freely.",
      price: "From $149",
      features: [
        "Debris Removal by Hand",
        "Downspout Flushing",
        "Roof Blowing",
        "Ground Cleanup Included",
        "Before/After Photos",
      ],
    },
    {
      title: "Roof Cleaning",
      description: "Extend the lifespan of your roof. We treat and remove unsightly moss and black streaks (Gloeocapsa Magma) that eat away at your shingles.",
      price: "From $399",
      features: [
        "Moss & Lichen Removal",
        "Prevents Shingle Decay",
        "Low Pressure Treatment",
        "Increases Roof Longevity",
        "Instant Curb Appeal",
      ],
    },
    {
      title: "Pressure Washing",
      description: "Revitalize your hardscapes. We blast away grime, oil, and salt from durable surfaces like concrete and interlock to make them look new again.",
      price: "From $199",
      features: [
        "Driveways & Walkways",
        "Patios & Pool Decks",
        "Fences & Decks",
        "Oil Stain Treatment",
        "Weed Removal",
      ],
    },
    {
      title: "Commercial Services",
      description: "Reliable maintenance for businesses. From storefronts to low-rise office buildings, we provide consistent cleaning schedules that suit your needs.",
      price: "Custom Quotes",
      features: [
        "Storefronts & Offices",
        "Flexible Scheduling",
        "General Liability Insured",
        "Monthly/Quarterly Plans",
        "Electronic Invoicing",
      ],
    },
  ];

  return (
    <>
      {services.map((service) => (
        <ServiceSchema
          key={service.title}
          name={service.title}
          description={service.description}
          priceRange={service.price}
          areaServed="Ottawa, ON"
        />
      ))}
      
      <main className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <header className="text-center">
            <p className="text-base font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">Our Expertise</p>
            <h1 className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Complete Exterior Cleaning Services in Ottawa
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-400">
              From your roof down to your driveway, we have the specialized equipment and training to clean every inch of your property safely.
            </p>
          </header>

        <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-8 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>

        <PricingCalculator />

        <div className="mt-20">
          <div className="bg-primary-50 dark:bg-gray-800 rounded-2xl p-8 sm:p-12 transition-colors duration-300">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Commercial Maintenance Plans</h3>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
                  Looking for regular cleaning for your business? We offer customized monthly and bi-weekly plans to keep your commercial space looking its best. Contact us for a free on-site estimate.
                </p>
              </div>
              <div className="mt-8 sm:mt-0 sm:ml-10 sm:flex-shrink-0">
                <a
                  href={siteConfig.business.googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-300"
                >
                  Request Commercial Quote
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <CTA />
    </>
  );
}
