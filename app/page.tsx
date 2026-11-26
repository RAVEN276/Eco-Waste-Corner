import Link from "next/link";
import { CommonMistakes } from "@/components/landing/CommonMistakes";
import { Hero } from "@/components/landing/Hero";
import { PointRules } from "@/components/landing/PointRules";
import { PrepGuide } from "@/components/landing/PrepGuide";
import { Sdg12Banner } from "@/components/landing/Sdg12Banner";
import { SortGame } from "@/components/landing/SortGame";
import { SortSteps } from "@/components/landing/SortSteps";
import { WasteCategories } from "@/components/landing/WasteCategories";
import { WasteDictionary } from "@/components/landing/WasteDictionary";
import { buttonClasses } from "@/components/ui/Button";

// Huruf A dan B sama dengan penanda di denah peta.
const SPOTS = [
  { letter: "A", name: "Spot A", place: "Dekat Pantry Kantin" },
  { letter: "B", name: "Spot B", place: "Dekat Parkiran Motor" },
];

// Urutan: hero berwarna, bagian Edukasi (panduan tong, tiga pertanyaan, kesalahan umum, kamus,
// latihan interaktif), konteks SDG, aturan poin (gelap), titik lokasi.
// Seluruh bagian Edukasi dibungkus satu elemen id="edukasi": itu tujuan tautan menu, dan navbar
// menyorot "Edukasi" selama bagian ini yang sedang dibaca (lihat useEdukasiActive di Navbar).
export default function HomePage() {
  return (
    <>
      <Hero />
      <div id="edukasi">
        <WasteCategories />
        <PrepGuide />
        <SortSteps />
        <CommonMistakes />
        <WasteDictionary />
        <SortGame />
      </div>
      <Sdg12Banner />
      <PointRules />
      <section className="bg-cobalt text-white" aria-labelledby="judul-lokasi">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-14 md:grid-cols-[1fr_1.1fr] md:items-center md:py-20">
          <div className="reveal">
            <h2 id="judul-lokasi" className="text-4xl sm:text-5xl lg:text-6xl">
              Dua titik Eco Waste Corner di kampus
            </h2>
            <p className="mt-3 max-w-md text-base sm:mt-4 sm:text-lg">
              Lihat letaknya di denah, foto areanya, dan rute jalan kaki ke tiap titik.
            </p>
            <Link href="/map" className={buttonClasses("light", "lg", "mt-6 w-full sm:w-auto")}>
              Lihat peta lokasi
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SPOTS.map((spot, index) => (
              <li
                key={spot.letter}
                className="reveal flex items-center gap-4 rounded-sheet border-2 border-line bg-surface p-4 text-ink"
                style={{ ["--delay" as string]: `${index * 140}ms` }}
              >
                <span
                  aria-hidden="true"
                  className="font-display text-6xl font-extrabold leading-none text-link sm:text-8xl"
                >
                  {spot.letter}
                </span>
                <span>
                  <span className="block font-bold">{spot.name}</span>
                  <span className="block text-muted">{spot.place}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
