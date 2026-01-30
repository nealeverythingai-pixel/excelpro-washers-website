"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-9 bg-gray-200 rounded-full" />;
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-16 h-9 rounded-full p-1 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        isDark ? "bg-slate-800" : "bg-sky-300"
      }`}
      aria-label="Toggle theme"
    >
      {/* Icons in the background track */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun className={`w-4 h-4 text-white ${isDark ? "opacity-50" : "opacity-100"}`} />
        <Moon className={`w-4 h-4 text-white ${isDark ? "opacity-100" : "opacity-50"}`} />
      </div>

      {/* The Knob */}
      <motion.div
        className="relative w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center z-10"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-slate-800" />
        ) : (
          <Sun className="w-4 h-4 text-orange-500" />
        )}
      </motion.div>
    </button>
  );
}
