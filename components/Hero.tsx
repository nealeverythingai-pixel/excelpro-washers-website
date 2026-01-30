"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { FadeIn } from "@/components/ui/FadeIn";
import { TextGenerateEffect } from "@/components/ui/TextGenerateEffect";
import { PerspectiveGrid } from "@/components/ui/PerspectiveGrid";
import { FloatingBubbles } from "@/components/ui/FloatingBubbles";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="relative bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      <PerspectiveGrid />
      <FloatingBubbles />
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 lg:bg-white/80 dark:lg:bg-gray-900/80">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <FadeIn delay={0.1}>
                <div className="mb-4">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                    ⭐ 4.9/5 Stars • 500+ Jobs Completed
                  </span>
                </div>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Ottawa's #1 Rated</span>{" "}
                  <span className="block text-primary-600 dark:text-primary-400 xl:inline">
                    <TextGenerateEffect words="Exterior Cleaning Experts" />
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Professional soft washing, pressure washing, and streak-free window cleaning. 
                  <strong className="text-gray-900 dark:text-white"> Same-day response guaranteed.</strong> Fully insured with $2M liability coverage.
                </p>
              </FadeIn>
              <FadeIn delay={0.3}>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                  <div className="rounded-md shadow">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={siteConfig.business.googleFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:text-lg md:px-10 shadow-lg shadow-primary-500/30"
                    >
                      📋 Get Instant Quote
                    </motion.a>
                  </div>
                  <div className="mt-3 sm:mt-0 rounded-md shadow">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`tel:${siteConfig.business.phone}`}
                      className="w-full flex items-center justify-center px-8 py-4 border-2 border-primary-600 text-base font-medium rounded-md text-primary-700 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 md:text-lg md:px-10"
                    >
                      📞 {siteConfig.business.phone}
                    </motion.a>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 sm:text-center lg:text-left">
                  💬 <strong>Same-day quotes available</strong> • No commitment required • Free estimates
                </p>
              </FadeIn>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full relative"
        >
          <Image
            src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?q=80&w=2070&auto=format&fit=crop"
            alt="Bright clean living room window"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}
