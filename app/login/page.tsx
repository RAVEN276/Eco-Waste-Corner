import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { LoadingState } from "@/components/ui/States";

export const metadata: Metadata = {
  title: "Login Student UPJ",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState label="Menyiapkan halaman login" className="mx-auto my-20 max-w-md" />}>
      <LoginPanel />
    </Suspense>
  );
}
