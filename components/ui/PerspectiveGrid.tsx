"use client";

import { cn } from "@/lib/utils";

export function PerspectiveGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:500px]",
        className
      )}
    >
      <div className="absolute inset-0 [transform:rotateX(35deg)] origin-top">
        <div
          className={cn(
            "animate-[grid_20s_linear_infinite]",
            "[background-repeat:repeat] [background-size:100px_100px]",
            "[height:200%] [width:200%] [margin-left:-50%]",
            "[background-image:linear-gradient(to_right,rgba(2,132,199,0.15)_1px,transparent_0),linear-gradient(to_bottom,rgba(2,132,199,0.15)_1px,transparent_0)]",
            "dark:[background-image:linear-gradient(to_right,rgba(14,165,233,0.1)_1px,transparent_0),linear-gradient(to_bottom,rgba(14,165,233,0.1)_1px,transparent_0)]"
          )}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80" />
    </div>
  );
}
