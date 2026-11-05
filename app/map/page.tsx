import type { Metadata } from "next";
import { MapView } from "@/components/map/MapView";

export const metadata: Metadata = {
  title: "Peta Lokasi",
};

export default function MapPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">Peta Eco Waste Corner</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Spot A dekat Pantry Kantin dan Spot B dekat Parkiran Motor. Ketuk titik pada denah untuk melihat kapasitas
        tong dan rute jalan kaki.
      </p>
      <div className="mt-8">
        <MapView />
      </div>
    </div>
  );
}
