"use client";

import { LocationPhotoCard } from "@/components/map/LocationPhotoCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/ui/States";
import { useLocations } from "@/hooks/useRemoteList";

export function MapView() {
  const { items, status, source, error, reload } = useLocations();

  if (status === "loading") {
    return <LoadingState label="Memuat lokasi Eco Waste Corner" className="py-24" />;
  }

  return (
    <div className="space-y-5">
      {status === "error" ? (
        <ErrorState
          title="Data lokasi dari server gagal dimuat"
          message={`${error ?? "Terjadi kesalahan."} Peta menampilkan data bawaan.`}
          onRetry={reload}
          className="py-6"
        />
      ) : null}

      {status === "ready" && source === "default" ? (
        <InlineNotice tone="warning">
          Menampilkan data contoh. Koleksi <code className="rounded-sm bg-surface px-1">locations</code>{" "}
          di Firestore belum terisi.
        </InlineNotice>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          title="Belum ada lokasi"
          description="Titik Eco Waste Corner belum didaftarkan."
          action={
            <Button variant="outline" onClick={reload}>
              Muat ulang
            </Button>
          }
        />
      ) : (
        <ul className="space-y-6">
          {items.map((location, index) => (
            <li
              key={location.locationId}
              className="reveal"
              style={{ ["--delay" as string]: `${index * 120}ms` }}
            >
              <LocationPhotoCard location={location} index={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
