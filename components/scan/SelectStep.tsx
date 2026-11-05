"use client";

import { Leaf, MapPin, Recycle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState, InlineNotice, LoadingState } from "@/components/ui/States";
import { BIN_LIST } from "@/lib/data/bins";
import type { BinCategory, CampusLocation, DataSource } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ListStatus } from "@/hooks/useRemoteList";

const ICONS: Record<BinCategory, typeof Leaf> = {
  organik: Leaf,
  plastik_kertas: Recycle,
  residu: Trash2,
};

interface SelectStepProps {
  locations: CampusLocation[];
  locationsStatus: ListStatus;
  locationsSource: DataSource;
  locationsError: string | null;
  onReloadLocations: () => void;
  locationId: string | null;
  onLocationChange: (id: string) => void;
  category: BinCategory | null;
  onCategoryChange: (category: BinCategory) => void;
  onStart: () => void;
  blocked: boolean;
}

export function SelectStep(props: SelectStepProps) {
  const { locations, locationsStatus, locationId, category, blocked } = props;
  const ready = Boolean(locationId && category) && !blocked;

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-lg font-bold">1. Di mana kamu berada?</legend>
        {locationsStatus === "loading" ? (
          <LoadingState label="Memuat lokasi" className="mt-3 py-8" />
        ) : (
          <>
            {locationsStatus === "error" ? (
              <div className="mt-3">
                <ErrorState
                  title="Lokasi dari server gagal dimuat"
                  message={`${props.locationsError ?? "Terjadi kesalahan."} Memakai daftar lokasi bawaan.`}
                  onRetry={props.onReloadLocations}
                  className="py-6"
                />
              </div>
            ) : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {locations.map((location) => {
                const selected = location.locationId === locationId;
                return (
                  <label
                    key={location.locationId}
                    className={cn(
                      "flex min-h-16 items-center gap-3 rounded-xl border-2 p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest",
                      selected
                        ? "border-forest bg-mint-soft"
                        : "border-line bg-white hover:border-leaf",
                    )}
                  >
                    <input
                      type="radio"
                      name="lokasi"
                      className="sr-only"
                      checked={selected}
                      onChange={() => props.onLocationChange(location.locationId)}
                    />
                    <MapPin aria-hidden="true" className="size-6 shrink-0 text-leaf-deep" />
                    <span className="font-semibold">{location.name}</span>
                  </label>
                );
              })}
            </div>
          </>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-lg font-bold">2. Slot mana yang kamu pindai?</legend>
        <p className="mt-1 text-sm text-muted">
          Ini simulator: pilih slot seolah kamu memindai kode QR yang tertempel di slot itu.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {BIN_LIST.map((bin) => {
            const selected = bin.id === category;
            const Icon = ICONS[bin.id];
            return (
              <label
                key={bin.id}
                className={cn(
                  "flex min-h-28 flex-col justify-between gap-4 rounded-xl p-4 ring-offset-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-forest",
                  bin.tone.solid,
                  selected ? `ring-4 ${bin.tone.ring}` : "hover:brightness-110",
                )}
              >
                <input
                  type="radio"
                  name="slot"
                  className="sr-only"
                  checked={selected}
                  onChange={() => props.onCategoryChange(bin.id)}
                />
                <Icon aria-hidden="true" className="size-8" strokeWidth={1.75} />
                <span>
                  <span className="block text-lg font-bold">{bin.label}</span>
                  <span className="block text-sm opacity-90">
                    {selected ? "Dipilih" : bin.short}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {blocked ? (
        <InlineNotice tone="warning">
          Scan baru bisa dimulai setelah jeda selesai. Hitung mundur ada di atas.
        </InlineNotice>
      ) : null}

      <Button size="lg" className="w-full sm:w-auto" disabled={!ready} onClick={props.onStart}>
        Pindai slot ini dan mulai kuis
      </Button>
    </div>
  );
}
