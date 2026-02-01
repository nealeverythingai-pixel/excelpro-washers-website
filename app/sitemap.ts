import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/services", "/contact", "/blog", "/about"];
  
  const blogPosts = [
    "/blog/best-window-cleaners-ottawa",
    "/blog/soft-wash-vs-pressure-wash-ottawa",
    "/blog/pressure-washing-ottawa-guide"
  ];

  const mainRoutes = routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : route === "/about" ? 0.9 : 0.8,
  }));

  const blogRoutes = blogPosts.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...mainRoutes, ...blogRoutes];
}
