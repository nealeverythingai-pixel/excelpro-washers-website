"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SqueegeeTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAnimating, setIsAnimating] = useState(true);

  // Reset animation when pathname changes
  useEffect(() => {
    setIsAnimating(true);
  }, [pathname]);

  return (
    <div className="relative min-h-screen w-full">
      {/* The Page Content */}
      {children}

      {/* The Squeegee Overlay */}
      {isAnimating && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end"
          initial={{ y: "0%" }}
          animate={{ y: "100%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          {/* The "Soapy" Foam Layer (Below the squeegee) */}
          <div className="absolute inset-0 bottom-auto h-[120vh] -top-[20vh] bg-gradient-to-b from-primary-50/95 to-white/95 backdrop-blur-md">
            {/* Bubbles decoration */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8),transparent_20%)] bg-[length:40px_40px]" />
          </div>

          <div className="w-full h-16 bg-primary-900 relative flex items-center justify-center shadow-2xl z-10">
            {/* Squeegee Handle Visual */}
            <div className="absolute bottom-full w-4 h-24 bg-primary-800 rounded-t-lg" />
            <div className="absolute bottom-full w-32 h-4 bg-primary-700 rounded-t-sm" />

            {/* Rubber Blade */}
            <div className="absolute bottom-0 w-full h-2 bg-black/50" />

            {/* Shine on metal */}
            <div className="absolute inset-x-0 top-2 h-1 bg-white/20" />
          </div>

          <div className="flex-grow bg-gradient-to-b from-primary-100/90 to-white/90 backdrop-blur-sm relative overflow-hidden">
            {/* Foam/Bubbles at the blade edge */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-white/40 blur-md" />
            <div className="absolute top-0 left-0 right-0 h-4 bg-white/60 blur-sm" />

            {/* Random bubbles in the soap */}
            <div className="absolute inset-0 opacity-50">
              <div className="absolute top-10 left-[10%] w-4 h-4 rounded-full border border-white bg-white/20" />
              <div className="absolute top-20 left-[20%] w-6 h-6 rounded-full border border-white bg-white/20" />
              <div className="absolute top-15 left-[80%] w-3 h-3 rounded-full border border-white bg-white/20" />
              <div className="absolute top-40 left-[50%] w-8 h-8 rounded-full border border-white bg-white/20" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
