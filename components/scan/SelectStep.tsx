"use client";

import { BinArt } from "@/components/art/BinArt";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { ErrorState, InlineNotice, LoadingState } from "@/components/ui/States";
import { BIN_LIST } from "@/lib/data/bins";
import { BASE_POINTS } from "@/lib/scoring";
import type { BinCategory, CampusLocation, DataSource } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ListStatus } from "@/hooks/useRemoteList";

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
    <div className="space-y-10">
      <fieldset>
        <legend className="font-display text-3xl font-extrabold">1. Di mana kamu berada?</legend>
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
              {locations.map((location, index) => {
                const selected = location.locationId === locationId;
                return (
                  <label
                    key={location.locationId}
                    className={cn(
                      "flex min-h-20 items-center gap-4 rounded-plate border-2 p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cobalt",
                      selected
                        ? "border-ink bg-cobalt-soft"
                        : "border-edge bg-white hover:bg-cobalt-soft",
                    )}
                  >
                    <input
                      type="radio"
                      name="lokasi"
                      className="sr-only"
                      checked={selected}
                      onChange={() => props.onLocationChange(location.locationId)}
                    />
                    <span
                      aria-hidden="true"
                      className="font-display text-6xl font-extrabold leading-none text-cobalt"
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 font-bold">{location.name}</span>
                    {selected ? (
                      <>
                        <CheckIcon className="size-5 shrink-0" />
                        <span className="sr-only">Dipilih</span>
                      </>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </>
        )}
      </fieldset>

      <fieldset>
        <legend className="font-display text-3xl font-extrabold">2. Slot mana yang kamu pindai?</legend>
        <p className="mt-1 text-sm text-muted">
          Ini simulator: pilih slot seolah kamu memindai kode QR yang tertempel di slot itu.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {BIN_LIST.map((bin) => {
            const selected = bin.id === category;
            return (
              <label
                key={bin.id}
                className={cn(
                  "flex min-h-44 flex-col justify-between gap-3 rounded-plate border-2 border-ink p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-8 has-[:focus-visible]:outline-cobalt",
                  bin.tone.soft,
                  selected ? "ring-4 ring-ink ring-offset-2 ring-offset-white" : "hover:brightness-95",
                )}
              >
                <input
                  type="radio"
                  name="slot"
                  className="sr-only"
                  checked={selected}
                  onChange={() => props.onCategoryChange(bin.id)}
                />
                <span className="flex items-end justify-between gap-2">
                  <BinArt id={bin.id} className="w-20 shrink-0" />
                  <span className="text-right">
                    <span className="block font-display text-6xl font-extrabold leading-none">
                      {BASE_POINTS[bin.id]}
                    </span>
                    <span className="text-xs font-bold">poin dasar</span>
                  </span>
                </span>
                <span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-3xl font-extrabold leading-none">
                      {bin.label}
                    </span>
                    {selected ? (
                      <span className="flex items-center gap-1 text-sm font-bold">
                        <CheckIcon className="size-4" />
                        Dipilih
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm">{bin.short}</span>
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
