"use client";

import { GlassCard } from "@/components/ui/Card";
import type { CampusLocation, CapacityStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const MARKER_TONE: Record<CapacityStatus, string> = {
  Kosong: "bg-forest text-white",
  Terisi: "bg-sun text-charcoal",
  Penuh: "bg-brick text-white",
};

interface CampusMapProps {
  locations: CampusLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Schematic plan, not a survey: it shows where the two Eco Waste Corner spots
 * sit relative to each other. Marker positions come from `coordinates` (percent).
 */
export function CampusMap({ locations, selectedId, onSelect }: CampusMapProps) {
  return (
    <div className="relative aspect-[10/7] w-full overflow-hidden rounded-2xl border border-line bg-mint-soft">
      <svg viewBox="0 0 100 70" className="absolute inset-0 size-full" role="img" aria-label="Denah skematik kampus UPJ dengan dua titik Eco Waste Corner">
        <rect x="3" y="3" width="94" height="64" rx="4" fill="#e3f6ee" stroke="#a8e6cf" strokeWidth="1" />
        {/* open green area */}
        <rect x="40" y="38" width="24" height="22" rx="3" fill="#a8e6cf" opacity="0.7" />
        <rect x="8" y="8" width="26" height="16" rx="3" fill="#a8e6cf" opacity="0.7" />
        {/* built areas */}
        <rect x="12" y="44" width="28" height="16" rx="2" fill="#d9e2de" />
        <rect x="58" y="12" width="30" height="20" rx="2" fill="#d9e2de" />
        <rect x="42" y="12" width="12" height="20" rx="2" fill="#d9e2de" />
        {/* walkways */}
        <path d="M6 36 H94" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M38 6 V64" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M74 36 V62" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
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
            style={{ left: `${location.coordinates.x}%`, top: `${location.coordinates.y}%` }}
            className={cn(
              "absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white font-display text-lg font-extrabold transition-transform hover:scale-110",
              MARKER_TONE[location.statusCapacity],
              selected && "scale-110 ring-4 ring-forest",
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
