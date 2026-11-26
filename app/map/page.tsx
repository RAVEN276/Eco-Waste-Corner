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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:py-9">
          <ScrollLinked
            y={[0, 24]}
            scale={[1, 0.97]}
            range="exit"
            originClassName="origin-top-left"
          >
            <h1 className="fade-up text-4xl sm:text-5xl lg:text-7xl">Peta Eco Waste Corner</h1>
            <p className="fade-up mt-2.5 max-w-2xl text-base sm:mt-3 sm:text-lg" style={{ ["--delay" as string]: "120ms" }}>
              Tiap titik punya tiga tong: Organik, Plastik / Kertas, dan Residu. Ketuk titik di denah, atau
              pilih dari daftar, untuk melihat foto area dan rute jalan kaki.
            </p>
          </ScrollLinked>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <MapView />
      </div>
    </>
  );
}
