"use client";

import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/components/providers/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>{children}</AuthProvider>
    </MotionConfig>
  );
}
