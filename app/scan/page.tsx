import { Suspense } from "react";
import type { Metadata } from "next";
import { ScanFlow } from "@/components/scan/ScanFlow";
import { LoadingState } from "@/components/ui/States";

export const metadata: Metadata = {
  title: "Scan QR",
};

export default function ScanPage() {
  return (
    <Suspense fallback={<LoadingState label="Menyiapkan halaman scan" className="mx-auto my-20 max-w-md" />}>
      <ScanFlow />
    </Suspense>
  );
}
