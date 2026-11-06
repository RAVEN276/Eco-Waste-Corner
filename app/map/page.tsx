import type { Metadata } from "next";
import { MapView } from "@/components/map/MapView";
import { ScrollLinked } from "@/components/ui/ScrollLinked";

export const metadata: Metadata = {
  title: "Peta Lokasi",
};

export default function MapPage() {
  return (
    <>
      <div className="border-b-2 border-line bg-cobalt-soft">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <ScrollLinked
            y={[0, 24]}
            scale={[1, 0.97]}
            range="exit"
            originClassName="origin-top-left"
          >
            <h1 className="fade-up text-6xl sm:text-7xl lg:text-8xl">Peta Eco Waste Corner</h1>
            <p className="fade-up mt-4 max-w-2xl text-lg" style={{ ["--delay" as string]: "120ms" }}>
              Spot A dekat Pantry Kantin dan Spot B dekat Parkiran Motor. Ketuk titik pada denah
              untuk melihat kapasitas tong dan rute jalan kaki.
            </p>
          </ScrollLinked>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
        <MapView />
      </div>
    </>
  );
}
