"use client";

import { useState } from "react";
import { CampusMap } from "@/components/map/CampusMap";
import { LocationCard } from "@/components/map/LocationCard";
import { LocationDialog } from "@/components/map/LocationDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/ui/States";
import { useLocations } from "@/hooks/useRemoteList";

export function MapView() {
  const { items, status, source, error, reload } = useLocations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((l) => l.locationId === selectedId) ?? null;

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
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <CampusMap locations={items} selectedId={selectedId} onSelect={setSelectedId} />

          <div>
            <h2 className="reveal-r text-4xl">Titik di kampus</h2>
            <ul className="mt-3 space-y-4">
              {items.map((location, index) => (
                <li
                  key={location.locationId}
                  className="reveal-r"
                  style={{ ["--delay" as string]: `${150 + index * 120}ms` }}
                >
                  <LocationCard location={location} index={index} onOpen={() => setSelectedId(location.locationId)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <LocationDialog location={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
