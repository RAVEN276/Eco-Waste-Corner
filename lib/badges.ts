export interface Badge {
  id: string;
  label: string;
  description: string;
  /** Total valid scans needed to unlock. */
  minScans: number;
}

export const BADGES: Badge[] = [
  { id: "pemilah-pemula", label: "Pemilah Pemula", description: "Menyelesaikan scan pertama", minScans: 1 },
  { id: "eco-warrior", label: "Eco Warrior", description: "10 scan pemilahan", minScans: 10 },
  { id: "recycling-champion", label: "Recycling Champion", description: "30 scan pemilahan", minScans: 30 },
];

export interface BadgeProgress {
  unlocked: Badge[];
  locked: Badge[];
  current: Badge | null;
  next: Badge | null;
  /** Scans still needed for the next badge, or 0 when all are unlocked. */
  remaining: number;
}

export function getBadgeProgress(totalScan: number): BadgeProgress {
  const unlocked = BADGES.filter((b) => totalScan >= b.minScans);
  const locked = BADGES.filter((b) => totalScan < b.minScans);
  const next = locked[0] ?? null;
  return {
    unlocked,
    locked,
    current: unlocked[unlocked.length - 1] ?? null,
    next,
    remaining: next ? next.minScans - totalScan : 0,
  };
}
