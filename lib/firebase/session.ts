const SESSION_KEY = "ewc:session";

export const AWAY_EXPIRE_MS = 10 * 60 * 1000;
export const SITE_EXPIRE_MS = 60 * 60 * 1000;
export const SESSION_HEARTBEAT_MS = 15 * 1000;

export type SessionExpireReason = "away" | "site";

interface SessionActivity {
  uid: string;
  loginAt: number;
  lastVisibleAt: number;
}

const EXPIRE_MESSAGES: Record<SessionExpireReason, string> = {
  away: "Sesi login berakhir karena kamu berada di luar situs lebih dari 10 menit. Silakan masuk lagi.",
  site: "Sesi login berakhir setelah 1 jam. Silakan masuk lagi.",
};

export function getExpireMessage(reason: SessionExpireReason): string {
  return EXPIRE_MESSAGES[reason];
}

function readActivity(): SessionActivity | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionActivity>;
    if (
      typeof parsed.uid !== "string" ||
      typeof parsed.loginAt !== "number" ||
      typeof parsed.lastVisibleAt !== "number"
    ) {
      return null;
    }
    return { uid: parsed.uid, loginAt: parsed.loginAt, lastVisibleAt: parsed.lastVisibleAt };
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

function expiredReason(activity: SessionActivity, now: number): SessionExpireReason | null {
  if (now - activity.lastVisibleAt >= AWAY_EXPIRE_MS) return "away";
  if (now - activity.loginAt >= SITE_EXPIRE_MS) return "site";
  return null;
}

/**
 * Memeriksa sesi yang tersimpan saat login terdeteksi. Jika belum ada atau milik akun lain,
 * memulai sesi baru; jika sudah melewati batas 10 menit di luar situs atau 1 jam total, mengembalikan alasannya.
 */
export function ensureSessionActivity(
  uid: string,
  now: number,
  visible: boolean,
): { reason: SessionExpireReason | null; loginAt: number } {
  const current = readActivity();
  if (!current || current.uid !== uid) {
    writeActivity({ uid, loginAt: now, lastVisibleAt: now });
    return { reason: null, loginAt: now };
  }

  const reason = expiredReason(current, now);
  if (reason) return { reason, loginAt: current.loginAt };

  if (visible) {
    writeActivity({ uid, loginAt: current.loginAt, lastVisibleAt: now });
  }
  return { reason: null, loginAt: current.loginAt };
}

/** Memperbarui cap waktu aktif saat tab terlihat, atau menandai saat keluar dari tab/halaman. */
export function touchSessionActivity(
  uid: string,
  now: number,
  updateLastVisible: boolean,
): { reason: SessionExpireReason | null; loginAt: number } {
  const current = readActivity();
  if (!current || current.uid !== uid) {
    writeActivity({ uid, loginAt: now, lastVisibleAt: now });
    return { reason: null, loginAt: now };
  }

  const reason = expiredReason(current, now);
  if (reason) return { reason, loginAt: current.loginAt };

  if (updateLastVisible) {
    writeActivity({ uid, loginAt: current.loginAt, lastVisibleAt: now });
  }
  return { reason: null, loginAt: current.loginAt };
}
