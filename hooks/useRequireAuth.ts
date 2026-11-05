"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

/** Redirects signed-out visitors to the login page and remembers where they were going. */
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const authStatus = useUserStore((s) => s.authStatus);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [authStatus, pathname, router]);

  return authStatus;
}
