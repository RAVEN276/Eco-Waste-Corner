"use client";

import { useState } from "react";
import { CampusMap } from "@/components/map/CampusMap";
import { CapacityBadge } from "@/components/map/CapacityBadge";
import { LocationDialog } from "@/components/map/LocationDialog";
import { Button } from "@/components/ui/Button";
import { RefreshIcon } from "@/components/ui/Icons";
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
          Menampilkan data contoh. Koleksi <code className="rounded-sm bg-white px-1">locations</code>{" "}
          di Firestore belum terisi, jadi status kapasitas belum real-time.
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <CampusMap locations={items} selectedId={selectedId} onSelect={setSelectedId} />

          <div>
            <div className="reveal-r flex items-center justify-between gap-3">
              <h2 className="text-4xl">Titik Eco Waste Corner</h2>
              <Button variant="ghost" onClick={reload} aria-label="Muat ulang status kapasitas">
                <RefreshIcon className="size-4" />
                Perbarui
              </Button>
            </div>
            <ul className="mt-3 space-y-3">
              {items.map((location, index) => (
                <li
                  key={location.locationId}
                  className="reveal-r"
                  style={{ ["--delay" as string]: `${150 + index * 120}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(location.locationId)}
                    aria-haspopup="dialog"
                    className="flex w-full items-center gap-4 rounded-plate border-2 border-ink bg-white p-4 text-left hover:bg-cobalt-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display text-6xl font-extrabold leading-none text-cobalt"
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{location.name}</span>
                      <CapacityBadge status={location.statusCapacity} className="mt-2" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <LocationDialog location={selected} source={source} onClose={() => setSelectedId(null)} />
    </div>
  );
}
