const SESSION_KEY = "ewc:session";

export const AWAY_EXPIRE_MS = 10 * 60 * 1000;
export const SESSION_HEARTBEAT_MS = 15 * 1000;

export type SessionExpireReason = "away";

interface SessionActivity {
  uid: string;
  lastVisibleAt: number;
}

const EXPIRE_MESSAGES: Record<SessionExpireReason, string> = {
  away: "Sesi login berakhir karena kamu berada di luar situs lebih dari 10 menit. Silakan masuk lagi.",
};

export function getExpireMessage(reason: SessionExpireReason): string {
  return EXPIRE_MESSAGES[reason];
}

function readActivity(): SessionActivity | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionActivity>;
    if (typeof parsed.uid !== "string" || typeof parsed.lastVisibleAt !== "number") {
      return null;
    }
    return { uid: parsed.uid, lastVisibleAt: parsed.lastVisibleAt };
  } catch {
    return null;
  }
}

function writeActivity(activity: SessionActivity): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(activity));
  } catch {
    // Abaikan bila penyimpanan peramban dibatasi (misalnya mode privat ketat).
  }
}

export function clearSessionActivity(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Abaikan kegagalan akses localStorage.
  }
}

/**
 * Memeriksa dan memperbarui cap waktu aktif sesi. Mengembalikan `"away"` bila pengguna berada
 * di luar situs minimal 10 menit; selama pengguna tetap di dalam situs, sesi tidak kedaluwarsa.
 */
export function touchSessionActivity(
  uid: string,
  now: number,
  updateLastVisible: boolean,
): { reason: SessionExpireReason | null } {
  const current = readActivity();
  if (!current || current.uid !== uid) {
    writeActivity({ uid, lastVisibleAt: now });
    return { reason: null };
  }

  if (now - current.lastVisibleAt >= AWAY_EXPIRE_MS) {
    return { reason: "away" };
  }

  if (updateLastVisible) {
    writeActivity({ uid, lastVisibleAt: now });
  }
  return { reason: null };
}
