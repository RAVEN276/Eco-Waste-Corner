import Link from "next/link";
import { MapPin } from "lucide-react";
import { Hero } from "@/components/landing/Hero";
import { Sdg12Banner } from "@/components/landing/Sdg12Banner";
import { WasteCategories } from "@/components/landing/WasteCategories";
import { PointRules } from "@/components/landing/PointRules";
import { buttonClasses } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Sdg12Banner />
      <WasteCategories />
      <PointRules />
      <section className="bg-mint-soft" aria-labelledby="judul-lokasi">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="judul-lokasi" className="text-2xl font-bold text-forest sm:text-3xl">
              Dua titik Eco Waste Corner di kampus
            </h2>
            <p className="mt-2 text-muted">
              Spot A dekat Pantry Kantin dan Spot B dekat Parkiran Motor. Cek kapasitas tong sebelum
              berjalan ke sana.
            </p>
          </div>
          <Link href="/map" className={buttonClasses("outline", "lg", "shrink-0")}>
            <MapPin aria-hidden="true" className="size-5" />
            Lihat peta lokasi
          </Link>
        </div>
      </section>
    </>
  );
}
