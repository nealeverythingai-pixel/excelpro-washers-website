export const siteConfig = {
  name: "ExcelPro Washers",
  description: "Ottawa's top-rated window cleaning, pressure washing, and soft wash experts. Serving Ottawa, Kanata, Orleans, and Barrhaven with streak-free results.",
  keywords: [
    "Window Cleaning Ottawa",
    "Window Cleaners near me",
    "Pressure Washing Ottawa",
    "Soft Wash Ottawa",
    "Gutter Cleaning Ottawa",
    "Interior Window Cleaning",
    "Post-Renovation Cleaning",
    "Commercial Window Cleaning",
    "Residential Window Cleaning",
    "Ottawa Window Cleaners",
    "Professional Window Washers",
    "Winter Window Cleaning",
  ],
  url: "https://excelprowashers.com",
  ogImage: "https://excelprowashers.com/logo.svg",
  logo: "/logo.svg",
  logoHorizontal: "/logo-horizontal.svg",
  links: {
    twitter: "https://twitter.com/excelprowashers",
    github: "https://github.com/excelprowashers",
  },
  business: {
    name: "ExcelPro Washers",
    address: {
      streetAddress: "123 Main St", // Placeholder
      addressLocality: "Ottawa",
      addressRegion: "ON",
      postalCode: "K1A 0B1", // Placeholder
      addressCountry: "CA",
    },
    phone: "+1-343-321-5300",
    sms: "+1-343-321-5300",
    email: "info@excelprowashers.com",
    hours: "Mon–Sat 8am–6pm",
    areaServed: "Ottawa, ON",
    priceRange: "$200+",
    googleFormUrl: "/contact",
  },
  services: [
    {
      title: "Soft Washing",
      description: "Low-pressure house washing to safely remove dirt, mold, and algae from your siding without damage. Perfect for Vinyl, Stucco, and Wood.",
      price: "Starting at $299",
    },
    {
      title: "Pressure Washing",
      description: "High-power cleaning for durable surfaces like driveways, walkways, and patios to remove tough stains, oil, and grime.",
      price: "Starting at $199",
    },
    {
      title: "Gutter Cleaning",
      description: "Complete removal of debris from gutters and downspouts to prevent water damage and ensure proper drainage.",
      price: "Starting at $149",
    },
    {
      title: "Roof Cleaning",
      description: "Specialized soft wash treatment to remove black streaks, moss, and lichen, extending your roof's lifespan.",
      price: "Starting at $399",
    },
    {
      title: "Window Cleaning",
      description: "Professional interior and exterior window cleaning leaving your glass streak-free and crystal clear.",
      price: "Starting at $199",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
