import { BinArt } from "@/components/art/BinArt";
import { Button } from "@/components/ui/Button";
import { BIN_LIST } from "@/lib/data/bins";
import type { CampusLocation } from "@/lib/types";

interface LocationCardProps {
  location: CampusLocation;
  index: number;
  onOpen: () => void;
}

export function LocationCard({ location, index, onOpen }: LocationCardProps) {
  const headingId = `lokasi-${location.locationId}`;
  return (
    <article aria-labelledby={headingId} className="rounded-plate border-2 border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="font-display text-6xl font-extrabold leading-none text-link">
          {String.fromCharCode(65 + index)}
        </span>
        <h3 id={headingId} className="min-w-0 flex-1 text-2xl leading-tight">
          {location.name}
        </h3>
      </div>

      {/* Tiga tong di tiap titik, urut seperti slotnya. Gambarnya dekoratif, namanya yang dibaca. */}
      <ul className="mt-4 grid grid-cols-3 gap-2">
        {BIN_LIST.map((bin) => (
          <li
            key={bin.id}
            className="flex flex-col items-center rounded-ctl border-2 border-rule bg-paper px-1.5 pb-2.5 pt-2 text-center"
          >
            <BinArt id={bin.id} className="w-10 sm:w-12" />
            <span className="mt-1 font-display text-lg font-extrabold leading-tight text-balance sm:text-xl">
              {bin.label}
            </span>
          </li>
        ))}
      </ul>

      <Button variant="outline" className="mt-4 w-full" onClick={onOpen} aria-haspopup="dialog">
        Lihat rute dan foto area
        <span className="sr-only"> {location.name}</span>
      </Button>
    </article>
  );
}
