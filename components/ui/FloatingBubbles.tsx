"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate bubbles only on client side to avoid hydration mismatch
    const newBubbles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position
      size: Math.random() * 60 + 20, // Random size between 20px and 80px
      duration: Math.random() * 15 + 10, // Random duration between 10s and 25s
      delay: Math.random() * 10, // Random delay
    }));
    setBubbles(newBubbles);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full backdrop-blur-[2px] border border-sky-200 dark:border-white/40 shadow-[inset_0_0_20px_rgba(14,165,233,0.2),0_0_15px_rgba(14,165,233,0.4)] dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_15px_rgba(14,165,233,0.2)]"
          style={{
            left: `${bubble.x}%`,
            width: bubble.size,
            height: bubble.size,
            background: isDark
              ? "radial-gradient(120% 120% at 30% 30%, rgba(255, 255, 255, 0.1) 0%, rgba(56, 189, 248, 0.1) 30%, rgba(232, 121, 249, 0.1) 60%, rgba(255, 255, 255, 0.05) 100%)"
              : "radial-gradient(120% 120% at 30% 30%, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.1) 30%, rgba(232, 121, 249, 0.1) 60%, rgba(14, 165, 233, 0.05) 100%)",
          }}
          initial={{ y: "120vh", opacity: 0 }}
          animate={{
            y: "-20vh",
            opacity: [0, 1, 1, 0],
            x: ["0px", `${Math.random() * 50 - 25}px`, "0px"] // Slight wobble
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: "linear",
            times: [0, 0.1, 0.9, 1]
          }}
        />
      ))}
    </div>
  );
}
