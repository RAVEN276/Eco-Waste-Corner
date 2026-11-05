"use client";

import { BADGES, getBadgeProgress } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const MAX_SCANS = BADGES[BADGES.length - 1].minScans;

export function BadgesPanel() {
  const totalScan = useUserStore((s) => s.profile?.totalScan ?? 0);
  const progress = getBadgeProgress(totalScan);
  const reached = Math.min(totalScan, MAX_SCANS);

  return (
    <section aria-labelledby="judul-badge">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="judul-badge" className="text-5xl">
          Peringkat dan badge
        </h2>
        <p className="text-sm text-muted">
          {progress.next
            ? `${progress.remaining} scan lagi menuju ${progress.next.label}`
            : "Semua badge sudah terbuka"}
        </p>
      </div>
      <p className="mt-2 text-lg font-bold">
        Peringkat saat ini: {progress.current ? progress.current.label : "Belum ada, mulai scan pertamamu"}
      </p>

      <div className="mt-5">
        <div
          role="progressbar"
          aria-label="Progres scan menuju badge tertinggi"
          aria-valuemin={0}
          aria-valuemax={MAX_SCANS}
          aria-valuenow={reached}
          aria-valuetext={`${reached} dari ${MAX_SCANS} scan`}
          className="h-4 overflow-hidden rounded-ctl border-2 border-ink bg-white"
        >
          <div
            className="fill-scroll h-full bg-cobalt"
            style={{ width: `${(reached / MAX_SCANS) * 100}%` }}
          />
        </div>
        <div className="relative mt-1 h-5 text-xs font-bold" aria-hidden="true">
          {BADGES.map((badge, index) => (
            <span
              key={badge.id}
              className={cn(
                "absolute",
                index === BADGES.length - 1 ? "-translate-x-full" : "-translate-x-1/2",
              )}
              style={{ left: `${(badge.minScans / MAX_SCANS) * 100}%` }}
            >
              {badge.minScans}
            </span>
          ))}
        </div>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {BADGES.map((badge) => {
          const unlocked = totalScan >= badge.minScans;
          return (
            <li
              key={badge.id}
              className={cn(
                "flex items-center gap-4 rounded-plate border-2 p-4",
                unlocked
                  ? "border-ink bg-ink text-white"
                  : "border-dashed border-edge bg-white text-ink",
              )}
            >
              <span className="shrink-0 text-center" aria-hidden="true">
                <span className="block font-display text-6xl font-extrabold leading-none">
                  {badge.minScans}
                </span>
                <span className="text-xs font-bold">scan</span>
              </span>
              <div>
                <p className="font-bold">{badge.label}</p>
                <p className={cn("text-sm", unlocked ? "text-mist" : "text-muted")}>
                  {badge.description}
                </p>
                <p className="mt-1 text-xs font-bold">
                  {unlocked ? "Sudah terbuka" : `Terkunci, ${badge.minScans - totalScan} scan lagi`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
