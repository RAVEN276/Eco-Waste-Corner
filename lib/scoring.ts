import type { BinCategory, PenaltyReason, ScanStatus } from "@/lib/types";

export const COOLDOWN_MINUTES = 15;
export const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

export const BASE_POINTS: Record<BinCategory, number> = {
  organik: 3,
  plastik_kertas: 5,
  residu: 2,
};

/** Extra points when the quiz is fully correct and a photo proof is attached. */
export const FULL_PROOF_BONUS = 2;

export const PENALTY_POINTS: Record<PenaltyReason, number> = {
  item_mismatch: 3,
  duplicate_photo: 3,
  cooldown_violation: 2,
};

export const PENALTY_LABEL: Record<PenaltyReason, string> = {
  item_mismatch: "Sampah yang dilaporkan tidak sesuai dengan slot yang dipindai",
  duplicate_photo: "Foto yang sama pernah dipakai pada scan sebelumnya",
  cooldown_violation: "Scan dikirim saat cooldown 15 menit masih berjalan",
};

export interface ScoreInput {
  category: BinCategory;
  quizCorrect: number;
  quizTotal: number;
  hasPhoto: boolean;
  itemMatchesBin: boolean;
  duplicatePhoto: boolean;
}

export interface ScoreBreakdown {
  base: number;
  tier: "penuh" | "sebagian" | "nol";
  tierLabel: string;
  earned: number;
  penalty: PenaltyReason | null;
  penaltyPoints: number;
  /** Net change before the balance floor is applied. */
  net: number;
  status: ScanStatus;
}

/**
 * Tiered scoring:
 *  - quiz fully correct + photo     -> base + bonus
 *  - quiz fully correct, no photo   -> half of base (rounded up)
 *  - quiz half correct + photo      -> half of base (rounded up)
 *  - anything else                  -> 0
 * A detected violation zeroes the earned points and deducts the penalty.
 */
export function calculateScore(input: ScoreInput): ScoreBreakdown {
  const base = BASE_POINTS[input.category];
  const ratio = input.quizTotal > 0 ? input.quizCorrect / input.quizTotal : 0;
  const quizFull = ratio === 1;
  const quizHalf = ratio >= 0.5 && ratio < 1;

  let earned = 0;
  let tier: ScoreBreakdown["tier"] = "nol";
  let tierLabel = "Kuis belum benar, poin tidak diberikan";

  if (quizFull && input.hasPhoto) {
    earned = base + FULL_PROOF_BONUS;
    tier = "penuh";
    tierLabel = "Kuis benar semua dengan foto bukti";
  } else if (quizFull) {
    earned = Math.ceil(base / 2);
    tier = "sebagian";
    tierLabel = "Kuis benar semua tanpa foto bukti";
  } else if (quizHalf && input.hasPhoto) {
    earned = Math.ceil(base / 2);
    tier = "sebagian";
    tierLabel = "Kuis separuh benar dengan foto bukti";
  }

  let penalty: PenaltyReason | null = null;
  if (!input.itemMatchesBin) penalty = "item_mismatch";
  else if (input.duplicatePhoto) penalty = "duplicate_photo";

  if (penalty) {
    const penaltyPoints = PENALTY_POINTS[penalty];
    return {
      base,
      tier: "nol",
      tierLabel: PENALTY_LABEL[penalty],
      earned: 0,
      penalty,
      penaltyPoints,
      net: -penaltyPoints,
      status: "penalized",
    };
  }

  return {
    base,
    tier,
    tierLabel,
    earned,
    penalty: null,
    penaltyPoints: 0,
    net: earned,
    status: input.hasPhoto && earned > 0 ? "verified" : "unverified",
  };
}

/** Balance can never go below zero. */
export function applyToBalance(current: number, net: number): { balance: number; applied: number } {
  const balance = Math.max(0, current + net);
  return { balance, applied: balance - current };
}

export function isCoolingDown(cooldownUntil: number | null, now: number): boolean {
  return cooldownUntil !== null && cooldownUntil > now;
}

export const SCORE_TABLE_ROWS: { quiz: string; photo: string; points: string }[] = [
  { quiz: "Semua benar", photo: "Ada foto", points: "Poin dasar + 2" },
  { quiz: "Semua benar", photo: "Tanpa foto", points: "Setengah poin dasar" },
  { quiz: "Separuh benar", photo: "Ada foto", points: "Setengah poin dasar" },
  { quiz: "Separuh benar", photo: "Tanpa foto", points: "0" },
  { quiz: "Salah semua", photo: "Apa pun", points: "0" },
];
