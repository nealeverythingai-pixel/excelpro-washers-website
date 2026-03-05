"use client";

import { SqueegeeTransition } from "@/components/ui/SqueegeeTransition";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isSales = pathname?.startsWith("/sales");
  const isContractor = pathname?.startsWith("/contractor");

  // Skip page transition for portal/app routes
  if (isAdmin || isSales || isContractor) {
    return <>{children}</>;
  }

  return <SqueegeeTransition>{children}</SqueegeeTransition>;
}
