import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Display: Bricolage Grotesque has slightly irregular, friendly letterforms that
// suit a student-run campus program. Body: Public Sans is built for civic
// readability, which matters for the sorting guidance.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Eco Waste Corner UPJ",
    template: "%s | Eco Waste Corner UPJ",
  },
  description:
    "Ruang edukasi dan pemilahan sampah kampus Universitas Pembangunan Jaya. Pilah sampah, jawab kuis, kumpulkan poin JSDP.",
};

export const viewport: Viewport = {
  themeColor: "#1B4D3E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-forest focus:px-4 focus:py-2 focus:text-white"
        >
          Lewati ke konten
        </a>
        <Providers>
          <Navbar />
          <main id="konten-utama" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
