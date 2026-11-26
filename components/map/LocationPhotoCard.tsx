"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import type { CampusLocation } from "@/lib/types";

interface LocationPhotoCardProps {
  location: CampusLocation;
  index: number;
}

/** Foto area satu titik. Foto lokal dari public/ dioptimalkan next/image, alamat luar memakai img biasa. */
function LocationPhoto({ location }: { location: CampusLocation }) {
  const [failed, setFailed] = useState(false);
  const alt = `Foto tong sampah di ${location.name}`;

  if (!location.imageUrl || failed) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-plate border-2 border-dashed border-edge bg-paper px-4 text-center text-sm text-muted">
        {failed ? "Foto area gagal dimuat." : "Foto area belum diunggah pengelola."}
      </div>
    );
  }

  if (location.imageUrl.startsWith("/")) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-clip rounded-plate border-2 border-line">
        <Image
          src={location.imageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote URL from Firestore, host not known at build time
    <img
      src={location.imageUrl}
      alt={alt}
      width={640}
      height={360}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[16/9] w-full rounded-plate border-2 border-line object-cover"
    />
  );
}

/** Kartu satu titik: foto area di kiri dan keterangan lokasi di kanan, bertumpuk di ponsel. */
export function LocationPhotoCard({ location, index }: LocationPhotoCardProps) {
  const headingId = `lokasi-${location.locationId}`;
  return (
    <article
      aria-labelledby={headingId}
      className="grid items-center gap-5 rounded-plate border-2 border-line bg-surface p-4 sm:p-5 lg:grid-cols-[1.25fr_1fr] lg:gap-8"
    >
      <LocationPhoto key={location.imageUrl} location={location} />

      <div className="min-w-0">
        <div className="flex items-baseline gap-3">
          <span aria-hidden="true" className="font-display text-6xl font-extrabold leading-none text-link">
            {String.fromCharCode(65 + index)}
          </span>
          <h2 id={headingId} className="min-w-0 text-3xl leading-tight sm:text-4xl">
            {location.name}
          </h2>
        </div>
        {location.description ? (
          <p className="mt-3 max-w-prose text-base leading-relaxed">{location.description}</p>
        ) : (
          <p className="mt-3 text-sm text-muted">Keterangan lokasi belum diisi pengelola.</p>
        )}
        <Link href="/scan" className={buttonClasses("primary", "lg", "mt-5 w-full sm:w-auto")}>
          Scan di lokasi ini
        </Link>
      </div>
    </article>
  );
}
