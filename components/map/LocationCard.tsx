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
    <article aria-labelledby={headingId} className="rounded-plate border-2 border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="font-display text-5xl font-extrabold leading-none text-link">
          {String.fromCharCode(65 + index)}
        </span>
        <h3 id={headingId} className="min-w-0 flex-1 text-2xl leading-tight">
          {location.name}
        </h3>
      </div>

      {/* Tiga tong di tiap titik, urut seperti slotnya. Gambarnya dekoratif, namanya yang dibaca. Di ponsel berupa tiga
          petak berdampingan, dari lebar sm berupa chip satu baris. */}
      <ul className="mt-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        {BIN_LIST.map((bin) => (
          <li
            key={bin.id}
            className="flex flex-col items-center gap-1 rounded-ctl border-2 border-rule bg-paper px-1.5 py-2 text-center sm:flex-row sm:gap-1.5 sm:py-1 sm:pl-1.5 sm:pr-2.5 sm:text-left"
          >
            <BinArt id={bin.id} className="w-8 shrink-0 sm:w-6" />
            <span className="text-sm font-bold leading-tight text-balance">{bin.label}</span>
          </li>
        ))}
      </ul>

      <Button variant="outline" className="mt-3 w-full" onClick={onOpen} aria-haspopup="dialog">
        Lihat rute dan foto area
        <span className="sr-only"> {location.name}</span>
      </Button>
    </article>
  );
}
