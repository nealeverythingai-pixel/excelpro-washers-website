"use client";

import { SqueegeeTransition } from "@/components/ui/SqueegeeTransition";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return <SqueegeeTransition>{children}</SqueegeeTransition>;
}
