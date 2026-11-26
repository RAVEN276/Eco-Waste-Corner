import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { ScrollLinked } from "@/components/ui/ScrollLinked";

export const metadata: Metadata = {
  title: "Tentang Logo",
  description:
    "Filosofi bentuk, elemen, warna, dan identitas visual logo Eco Waste Corner Universitas Pembangunan Jaya.",
};

interface LogoElementItem {
  number: string;
  title: string;
  description: string;
  image: string;
  width: number;
  height: number;
}

const LOGO_ELEMENTS: LogoElementItem[] = [
  {
    number: "01",
    title: "Tunas dan Daun",
    description:
      "Melambangkan pertumbuhan, kehidupan, dan kepedulian terhadap kelestarian lingkungan.",
    image: "/logo/daun.png",
    width: 262,
    height: 262,
  },
  {
    number: "02",
    title: "Bentuk Tangan / Kelopak",
    description:
      "Menggambarkan perlindungan dan tanggung jawab manusia dalam menjaga alam.",
    image: "/logo/bentuk-tangan.png",
    width: 320,
    height: 212,
  },
  {
    number: "03",
    title: "Bentuk Lengkungan Terbuka",
    description:
      "Melambangkan perlindungan dan kepedulian terhadap lingkungan, sekaligus menggambarkan keterhubungan manusia dengan alam.",
    image: "/logo/bentuk-lengkungan-terbuka.png",
    width: 242,
    height: 262,
  },
];

interface LogoColorItem {
  hex: string;
  name: string;
  meaning: string;
}

const LOGO_COLORS: LogoColorItem[] = [
  {
    hex: "#1e7d4e",
    name: "Hijau",
    meaning:
      "Melambangkan kesuburan, kehidupan, dan kepedulian terhadap lingkungan. Warna hijau menjadi representasi utama dari konsep ramah lingkungan dan keberlanjutan.",
  },
  {
    hex: "#f2b71b",
    name: "Kuning",
    meaning:
      "Melambangkan energi positif, harapan, dan semangat untuk melakukan perubahan. Warna kuning juga memberikan kesan cerah dan menarik perhatian.",
  },
  {
    hex: "#354496",
    name: "Biru",
    meaning:
      "Melambangkan kepercayaan, kedisiplinan, dan kestabilan. Warna biru memberikan kesan terpercaya serta merepresentasikan komitmen dalam menjaga lingkungan secara berkelanjutan.",
  },
  {
    hex: "#2d2c34",
    name: "Abu Gelap",
    meaning:
      "Menggambarkan kesan kuat, tegas, dan profesional. Warna ini merepresentasikan komitmen serta tanggung jawab dalam menerapkan kebiasaan pengelolaan sampah.",
  },
];

export default function AboutLogoPage() {
  return (
    <>
      <section aria-labelledby="judul-tentang-logo" className="border-b-2 border-line bg-cobalt text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-9 sm:gap-10 sm:px-6 sm:py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-12 md:py-16">
          <div className="fade-up">
            <h1 id="judul-tentang-logo" className="text-4xl sm:text-6xl lg:text-7xl">
              Tentang Logo Eco Waste Corner
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white sm:mt-5 sm:text-lg">
              Logo Eco Waste Corner menggabungkan elemen tunas, daun, bentuk tangan, dan lengkungan terbuka yang
              merepresentasikan pertumbuhan, perlindungan, serta kepedulian terhadap lingkungan. Perpaduan elemen
              tersebut mencerminkan komitmen untuk membangun kebiasaan pengelolaan sampah yang bertanggung jawab demi
              menciptakan lingkungan yang bersih, hijau, dan berkelanjutan.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
              Didukung warna-warna yang melambangkan alam, optimisme, stabilitas, dan kepercayaan, logo ini menjadi
              simbol ajakan untuk memulai perubahan positif dari langkah sederhana.
            </p>
          </div>

          <ScrollLinked y={[0, 20]} scale={[1, 0.96]} range="exit" originClassName="origin-top">
            <div className="fade-up rounded-sheet border-2 border-line bg-surface p-6 text-center text-ink shadow-[8px_8px_0_var(--shadow-ink)] sm:p-8">
              <Image
                src="/brand-logo.png"
                alt="Logo resmi Eco Waste Corner UPJ"
                width={304}
                height={256}
                sizes="(max-width: 640px) 190px, 240px"
                priority
                className="mx-auto h-40 w-auto sm:h-48"
              />
              <p className="mt-5 font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl">
                ECO WASTE CORNER
              </p>
              <p className="mt-2 text-sm text-muted">Simbol identitas resmi program pemilahan sampah kampus UPJ</p>
            </div>
          </ScrollLinked>
        </div>
      </section>

      <section aria-labelledby="judul-elemen" className="border-b-2 border-line bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 md:py-20">
          <div className="reveal max-w-2xl">
            <h2 id="judul-elemen" className="text-4xl sm:text-5xl">
              Filosofi Bentuk dan Elemen Logo
            </h2>
            <p className="mt-3 text-base text-muted sm:text-lg">
              Tiga bagian utama membentuk kesatuan simbol antara manusia, tindakan menjaga alam, dan keberlanjutan.
            </p>
          </div>

          <ol className="mt-10 divide-y-2 divide-rule border-y-2 border-rule">
            {LOGO_ELEMENTS.map((item, index) => (
              <li
                key={item.number}
                className="reveal grid grid-cols-1 gap-4 py-7 sm:grid-cols-[4rem_6rem_1fr] sm:items-center sm:gap-6"
                style={{ ["--delay" as string]: `${index * 110}ms` }}
              >
                <div className="flex items-center gap-4 sm:contents">
                  <span
                    aria-hidden="true"
                    className="w-16 shrink-0 font-display text-5xl font-extrabold leading-none tabular-nums text-link sm:w-auto"
                  >
                    {item.number}
                  </span>
                  <div className="flex size-24 shrink-0 items-center justify-center rounded-plate border-2 border-line bg-surface p-3">
                    <Image
                      src={item.image}
                      alt=""
                      width={item.width}
                      height={item.height}
                      sizes="72px"
                      className="size-16 object-contain"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-3xl text-ink">{item.title}</h3>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="judul-warna-identitas" className="border-b-2 border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 md:py-20">
          <div className="reveal space-y-6">
            <div>
              <h2 id="judul-warna-identitas" className="text-4xl sm:text-5xl">
                Filosofi Warna dan Identitas
              </h2>
              <p className="mt-3 text-base text-muted">
                Empat warna utama dan bentuk brandmark menjaga identitas logo tetap dikenali di media cetak maupun
                digital.
              </p>
            </div>

            <div className="rounded-plate border-2 border-line bg-[#f2b71b] p-6 text-ink">
              <p className="text-xs font-bold text-ink">Brandmark Monokrom</p>
              <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Image
                  src="/brand-logo.png"
                  alt="Versi brandmark monokrom hitam Eco Waste Corner"
                  width={304}
                  height={256}
                  sizes="112px"
                  className="h-24 w-auto brightness-0"
                />
                <div className="text-center sm:text-right">
                  <p className="font-display text-2xl font-extrabold text-ink">ECO WASTE CORNER</p>
                  <p className="mt-1 text-sm text-ink">Logotype pedoman memakai font Gadugi</p>
                </div>
              </div>
            </div>

            <div className="rounded-plate border-2 border-rule bg-paper p-5">
              <p className="text-xs font-bold text-muted">Tipografi Pedoman Logo</p>
              <div className="mt-3 flex items-baseline gap-5">
                <span aria-hidden="true" className="font-display text-6xl font-extrabold leading-none text-ink">
                  Aa
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-bold text-ink">Gadugi</p>
                  <p className="mt-1 break-words text-muted">
                    Bb Cc Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 1234567890
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ul className="space-y-4">
            {LOGO_COLORS.map((color, index) => (
              <li
                key={color.hex}
                className="reveal flex flex-col gap-4 rounded-plate border-2 border-rule bg-paper p-5 sm:flex-row sm:items-start"
                style={{ ["--delay" as string]: `${index * 90}ms` }}
              >
                <div
                  aria-hidden="true"
                  className="h-16 w-full shrink-0 rounded-plate border-2 border-line sm:h-20 sm:w-20"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <h3 className="text-2xl text-ink">{color.name}</h3>
                    <code className="rounded-sm border border-rule bg-surface px-2 py-0.5 text-sm font-bold text-ink">
                      {color.hex}
                    </code>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted sm:text-base">{color.meaning}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="judul-aksi-logo" className="bg-cobalt-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 id="judul-aksi-logo" className="text-3xl sm:text-4xl">
              Mulai memilah di stasiun kampus UPJ
            </h2>
            <p className="mt-1 text-sm text-muted sm:text-base">
              Temukan dua titik stasiun pilah atau pindai QR di tong untuk mulai mengumpulkan poin.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
            <Link href="/scan" className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
              Mulai scan QR
            </Link>
            <Link href="/map" className={buttonClasses("outline", "lg", "w-full sm:w-auto")}>
              Lihat peta lokasi
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
