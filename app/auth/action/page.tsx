import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthActionPanel } from "@/components/auth/AuthActionPanel";
import { LoadingState } from "@/components/ui/States";

export const metadata: Metadata = {
  title: "Atur ulang akun",
  robots: { index: false, follow: false },
};

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={<LoadingState label="Menyiapkan halaman verifikasi" className="mx-auto my-20 max-w-md" />}
    >
      <AuthActionPanel />
    </Suspense>
  );
}
