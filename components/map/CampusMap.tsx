"use client";

import { GlassCard } from "@/components/ui/Card";
import type { CampusLocation, CapacityStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const MARKER_TONE: Record<CapacityStatus, string> = {
  Kosong: "bg-organik text-white",
  Terisi: "bg-kertas text-ink",
  Penuh: "bg-brick text-white",
};

interface CampusMapProps {
  locations: CampusLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Denah skematik, bukan hasil ukur: hanya menunjukkan posisi dua titik Eco Waste
 * Corner satu terhadap yang lain. Posisi penanda dari `coordinates` (persen).
 */
export function CampusMap({ locations, selectedId, onSelect }: CampusMapProps) {
  return (
    <div className="reveal relative aspect-[10/7] w-full overflow-hidden rounded-plate border-2 border-ink bg-[#eeece5]">
      <svg
        viewBox="0 0 100 70"
        className="absolute inset-0 size-full"
        role="img"
        aria-label="Denah skematik kampus UPJ dengan dua titik Eco Waste Corner"
      >
        {/* ruang terbuka */}
        <rect x="40" y="38" width="24" height="22" rx="2" fill="#ddf1e5" />
        <rect x="8" y="8" width="26" height="16" rx="2" fill="#ddf1e5" />
        {/* bangunan */}
        <rect x="12" y="44" width="28" height="16" rx="1.5" fill="#d3d6de" />
        <rect x="58" y="12" width="30" height="20" rx="1.5" fill="#d3d6de" />
        <rect x="42" y="12" width="12" height="20" rx="1.5" fill="#d3d6de" />
        {/* jalur jalan */}
        <path d="M0 36 H100" stroke="#ffffff" strokeWidth="3" />
        <path d="M38 0 V70" stroke="#ffffff" strokeWidth="3" />
        <path d="M74 36 V70" stroke="#ffffff" strokeWidth="3" />
      </svg>

      {locations.map((location, index) => {
        const selected = location.locationId === selectedId;
        return (
          <button
            key={location.locationId}
            type="button"
            onClick={() => onSelect(location.locationId)}
            aria-label={`${location.name}, kapasitas ${location.statusCapacity}. Buka detail`}
            aria-haspopup="dialog"
            style={{
              left: `${location.coordinates.x}%`,
              top: `${location.coordinates.y}%`,
              ["--delay" as string]: `${450 + index * 140}ms`,
            }}
            className={cn(
              "land absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-ctl border-2 border-ink font-display text-3xl font-extrabold leading-none transition-transform hover:scale-110",
              MARKER_TONE[location.statusCapacity],
              selected && "scale-110 ring-4 ring-ink ring-offset-2 ring-offset-white",
            )}
          >
            {String.fromCharCode(65 + index)}
          </button>
        );
      })}

      <GlassCard tone="dark" className="absolute bottom-3 left-3 max-w-[70%] p-2.5 text-xs sm:text-sm">
        Denah skematik, posisi tidak berskala
      </GlassCard>
    </div>
  );
}
