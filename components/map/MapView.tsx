"use client";

import { useState } from "react";
import { MapPinOff, RefreshCw } from "lucide-react";
import { CampusMap } from "@/components/map/CampusMap";
import { CapacityBadge } from "@/components/map/CapacityBadge";
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
          Menampilkan data contoh. Koleksi <code className="rounded bg-white px-1">locations</code> di Firestore belum
          terisi, jadi status kapasitas belum real-time.
        </InlineNotice>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon={<MapPinOff aria-hidden="true" className="size-8" />}
          title="Belum ada lokasi"
          description="Titik Eco Waste Corner belum didaftarkan."
          action={
            <Button variant="outline" onClick={reload}>
              Muat ulang
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <CampusMap locations={items} selectedId={selectedId} onSelect={setSelectedId} />

          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-forest">Titik Eco Waste Corner</h2>
              <Button variant="ghost" onClick={reload} aria-label="Muat ulang status kapasitas">
                <RefreshCw aria-hidden="true" className="size-4" />
                Perbarui
              </Button>
            </div>
            <ul className="mt-3 space-y-3">
              {items.map((location, index) => (
                <li key={location.locationId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(location.locationId)}
                    aria-haspopup="dialog"
                    className="flex w-full items-center gap-4 rounded-xl border border-line bg-white p-4 text-left hover:border-leaf"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-forest font-display text-lg font-extrabold text-white"
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{location.name}</span>
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
