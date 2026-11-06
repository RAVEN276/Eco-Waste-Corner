import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Big_Shoulders } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { BottomNav } from "@/components/layout/BottomNav";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollMotion } from "@/components/layout/ScrollMotion";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

// Tampilan: Big Shoulders, warisan papan penanda jalan, cocok untuk label tong dan
// angka poin, dan sempit sehingga nama panjang muat di layar ponsel.
// Isi: Atkinson Hyperlegible Next, dirancang untuk keterbacaan.
// Next tidak punya metrik font cadangan untuk kedua font ini, jadi penyesuaian otomatis
// dimatikan (sumber peringatan build) dan fallback dipilih manual: Arial Narrow untuk
// judul yang sempit, sistem untuk isi.
const signage = Big_Shoulders({
  variable: "--font-signage",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

const text = Atkinson_Hyperlegible_Next({
  variable: "--font-text",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Eco Waste Corner UPJ",
    template: "%s | Eco Waste Corner UPJ",
  },
  description:
    "Ruang edukasi dan pemilahan sampah kampus Universitas Pembangunan Jaya. Pilah sampah, jawab kuis, kumpulkan poin, lalu tukar jadi poin JSDP.",
};

export const viewport: Viewport = {
  themeColor: "#2438A6",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${signage.variable} ${text.variable} h-full`}
    >
      <head>
        {/* Memasang data-theme sebelum cat pertama. suppressHydrationWarning di <html> karena
            atributnya sengaja berbeda dari HTML server. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0">
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-ctl focus:bg-pick focus:px-4 focus:py-3 focus:text-on-pick"
        >
          Lewati ke konten
        </a>
        <Providers>
          <Navbar />
          <main id="konten-utama" className="flex-1 overflow-x-clip">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <ScrollMotion />
        </Providers>
      </body>
    </html>
  );
}
