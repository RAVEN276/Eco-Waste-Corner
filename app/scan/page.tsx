import type { Metadata } from "next";
import { ScanFlow } from "@/components/scan/ScanFlow";

export const metadata: Metadata = {
  title: "Scan QR",
};

export default function ScanPage() {
  return <ScanFlow />;
}
