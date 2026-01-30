import { siteConfig } from "@/lib/site";

export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": siteConfig.business.name,
    "image": siteConfig.ogImage,
    "telephone": siteConfig.business.phone,
    "email": siteConfig.business.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": siteConfig.business.address.streetAddress,
      "addressLocality": siteConfig.business.address.addressLocality,
      "addressRegion": siteConfig.business.address.addressRegion,
      "postalCode": siteConfig.business.address.postalCode,
      "addressCountry": siteConfig.business.address.addressCountry
    },
    "url": siteConfig.url,
    "priceRange": siteConfig.business.priceRange,
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "08:00",
      "closes": "18:00"
    },
    "areaServed": {
      "@type": "City",
      "name": siteConfig.business.areaServed
    },
    "sameAs": [
      siteConfig.links.twitter,
      siteConfig.links.github
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
