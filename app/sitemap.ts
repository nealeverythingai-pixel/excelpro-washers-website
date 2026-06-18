import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/services", "/contact", "/blog", "/about"];
  
  const blogPosts = [
    { slug: "best-window-cleaners-ottawa", date: "2024-03-20" },
    { slug: "soft-wash-vs-pressure-wash-ottawa", date: "2024-03-18" },
    { slug: "pressure-washing-ottawa-guide", date: "2024-03-15" },
    { slug: "gutter-cleaning-ottawa", date: "2025-10-14" },
    { slug: "roof-soft-wash-ottawa", date: "2025-11-18" },
    { slug: "spring-cleaning-checklist-ottawa", date: "2026-02-09" },
    { slug: "deck-cleaning-ottawa", date: "2026-03-12" },
    { slug: "commercial-window-cleaning-ottawa", date: "2026-04-02" },
    { slug: "post-construction-cleaning-ottawa", date: "2026-04-25" },
    { slug: "window-cleaning-kanata", date: "2026-05-20" },
  ];

  const mainRoutes = routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : route === "/about" ? 0.9 : 0.8,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...mainRoutes, ...blogRoutes];
}
