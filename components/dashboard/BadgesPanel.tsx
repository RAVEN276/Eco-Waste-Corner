"use client";

import { Lock, Medal, ShieldCheck, Sprout } from "lucide-react";
import { BADGES, getBadgeProgress } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const ICONS = {
  "pemilah-pemula": Sprout,
  "eco-warrior": ShieldCheck,
  "recycling-champion": Medal,
} as const;

export function BadgesPanel() {
  const totalScan = useUserStore((s) => s.profile?.totalScan ?? 0);
  const progress = getBadgeProgress(totalScan);

  return (
    <section aria-labelledby="judul-badge">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="judul-badge" className="text-2xl font-bold text-forest">
          Peringkat dan badge
        </h2>
        <p className="text-sm text-muted">
          {progress.next
            ? `${progress.remaining} scan lagi menuju ${progress.next.label}`
            : "Semua badge sudah terbuka"}
        </p>
      </div>
      <p className="mt-1 text-lg font-semibold">
        Peringkat saat ini: {progress.current ? progress.current.label : "Belum ada, mulai scan pertamamu"}
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {BADGES.map((badge) => {
          const unlocked = totalScan >= badge.minScans;
          const Icon = unlocked ? ICONS[badge.id as keyof typeof ICONS] : Lock;
          return (
            <li
              key={badge.id}
              className={cn(
                "flex items-center gap-4 rounded-xl p-4",
                unlocked ? "bg-mint text-forest" : "border-2 border-dashed border-line bg-white text-muted",
              )}
            >
              <Icon aria-hidden="true" className="size-8 shrink-0" strokeWidth={1.75} />
              <div>
                <p className={cn("font-bold", unlocked ? "text-forest" : "text-charcoal")}>{badge.label}</p>
                <p className="text-sm">
                  {badge.description}
                  <span className="sr-only">{unlocked ? ", sudah terbuka" : ", masih terkunci"}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
