"use client";

import { useState } from "react";
import Link from "next/link";
import { CapacityBadge } from "@/components/map/CapacityBadge";
import { buttonClasses } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { InlineNotice } from "@/components/ui/States";
import type { CampusLocation, DataSource } from "@/lib/types";

interface LocationDialogProps {
  location: CampusLocation | null;
  source: DataSource;
  onClose: () => void;
}

function LocationPhoto({ location }: { location: CampusLocation }) {
  const [failed, setFailed] = useState(false);

  if (!location.imageUrl || failed) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-plate border-2 border-dashed border-edge bg-paper px-4 text-center text-sm text-muted">
        {failed ? "Foto area gagal dimuat." : "Foto area belum diunggah pengelola."}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote URL from Firestore, host not known at build time
    <img
      src={location.imageUrl}
      alt={`Foto area ${location.name}`}
      width={640}
      height={360}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[16/9] w-full rounded-plate object-cover"
    />
  );
}

export function LocationDialog({ location, source, onClose }: LocationDialogProps) {
  return (
    <Dialog open={location !== null} onClose={onClose} title={location?.name ?? "Detail lokasi"}>
      {location ? (
        <div className="space-y-6">
          {/* key resets the image-failed state when switching locations */}
          <LocationPhoto key={location.locationId} location={location} />

          <div>
            <p className="text-sm font-bold text-muted">Status kapasitas tong</p>
            <CapacityBadge status={location.statusCapacity} className="mt-1.5" />
            {source === "default" ? (
              <InlineNotice tone="warning" className="mt-3">
                Status ini data contoh dan belum terhubung ke pembaruan langsung dari pengelola.
              </InlineNotice>
            ) : null}
          </div>

          <div>
            <h3 className="text-3xl">Petunjuk rute jalan kaki</h3>
            {location.routeSteps.length > 0 ? (
              <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm marker:font-bold">
                {location.routeSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-muted">Petunjuk rute belum diisi pengelola.</p>
            )}
          </div>

          <Link
            href="/scan"
            onClick={onClose}
            className={buttonClasses("primary", "lg", "w-full")}
          >
            Scan di lokasi ini
          </Link>
        </div>
      ) : null}
    </Dialog>
  );
}
