"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { AuthProvider } from "@/components/providers/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <AuthProvider>{children}</AuthProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
