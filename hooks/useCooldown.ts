"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";

export interface CooldownState {
  active: boolean;
  remainingMs: number;
  /** mm:ss */
  label: string;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Live countdown driven by the Zustand `cooldownUntil` value. The clock is read
 * inside effects only, so server rendering and hydration stay deterministic.
 */
export function useCooldown(): CooldownState {
  const cooldownUntil = useUserStore((s) => s.cooldownUntil);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (cooldownUntil === null) return;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      return current;
    };
    if (tick() >= cooldownUntil) return;
    const id = window.setInterval(() => {
      if (tick() >= cooldownUntil) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const remainingMs = cooldownUntil !== null && now !== null ? Math.max(0, cooldownUntil - now) : 0;
  return { active: remainingMs > 0, remainingMs, label: formatDuration(remainingMs) };
}
