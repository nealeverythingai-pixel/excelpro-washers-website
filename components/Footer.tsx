"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-gray-900 dark:bg-black text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{siteConfig.name}</h3>
            <p className="text-gray-400 text-sm">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {siteConfig.services.map((service) => (
                <li key={service.title}>
                  <Link href="/services" className="hover:text-white">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{siteConfig.business.address.addressLocality}, {siteConfig.business.address.addressRegion}</li>
              <li>
                <a href={`tel:${siteConfig.business.phone}`} className="hover:text-white">
                  {siteConfig.business.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.business.email}`} className="hover:text-white">
                  {siteConfig.business.email}
                </a>
              </li>
              <li className="pt-2">
                 <Link href="/careers" className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1">
                   We're Hiring! <span className="animate-pulse">🔥</span>
                 </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/admin" className="text-xs text-gray-600 hover:text-gray-400 opacity-50 hover:opacity-100 transition-opacity">
              Admin Login
            </Link>
            <Link href="/sales/login" className="text-xs text-gray-600 hover:text-gray-400 opacity-50 hover:opacity-100 transition-opacity">
              Sales Portal
            </Link>
            <Link href="/contractor/login" className="text-xs text-gray-600 hover:text-gray-400 opacity-50 hover:opacity-100 transition-opacity">
              Contractor Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
