"use client";

import { X, Megaphone } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/sales") || pathname?.startsWith("/contractor")) return null;
  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2 rounded-lg bg-primary-800">
              <Megaphone className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="ml-3 font-medium text-sm sm:text-base">
              <span className="inline">
                🎉 <strong>Winter Special:</strong> Book now and save 15% on all window cleaning services! Limited time offer.
              </span>
            </p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <a
              href="tel:+14389006384"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50"
            >
              Claim Offer
            </a>
          </div>
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="-mr-1 flex p-2 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
