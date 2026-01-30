"use client";

import { siteConfig } from "@/lib/site";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:hidden"
        >
          <a
            href={siteConfig.business.googleFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-primary-600 shadow-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Get a Quote Now
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
