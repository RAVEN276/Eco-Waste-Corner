"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { describeFirebaseError } from "@/lib/firebase/errors";
import {
  adjustUserPoints,
  deleteUserAccount,
  fetchAdminUsers,
  fetchUsersByIds,
  setUserDisabled,
  setUserPenaltyCooldown,
  type PenaltyCooldownUpdate,
} from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/types";
import type { AdminStatus } from "@/hooks/useAdminScans";

function describeDirectoryError(error: unknown): string {
  const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : undefined;
  if (code === "permission-denied") {
    return "Akses ke data pengguna ditolak. Pastikan kamu masuk dengan akun Google admin dan aturan Firestore terbaru sudah dideploy.";
  }
  return describeFirebaseError(error);
}

/** Direktori akun mahasiswa untuk panel admin: memuat daftar, mencari, mengubah poin, penalti, dan status akun. */
export function useAdminUsersDirectory() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [status, setStatus] = useState<AdminStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchAdminUsers()
      .then((list) => {
        if (cancelled) return;
        setUsers(list);
        setStatus("ready");
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setUsers([]);
        setStatus("error");
        setError(describeDirectoryError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  const refreshOne = useCallback(async (uid: string) => {
    try {
      const found = await fetchUsersByIds([uid]);
      const fresh = found.get(uid);
      if (!fresh) return;
      setUsers((prev) =>
        prev.some((u) => u.uid === uid) ? prev.map((u) => (u.uid === uid ? fresh : u)) : [fresh, ...prev],
      );
    } catch {
      // Tidak memblokir aksi utama bila sinkronisasi ulang gagal.
    }
  }, []);

  const patchUser = useCallback((uid: string, patch: Partial<UserProfile>) => {
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, ...patch } : u)));
  }, []);

  const adjustPoints = useCallback(
    async (uid: string, delta: number): Promise<number> => {
      try {
        const poin = await adjustUserPoints(uid, delta);
        patchUser(uid, { poin });
        return poin;
      } catch (err) {
        throw new Error(describeDirectoryError(err));
      }
    },
    [patchUser],
  );

  const updatePenalty = useCallback(
    async (uid: string, action: PenaltyCooldownUpdate) => {
      try {
        const updated = await setUserPenaltyCooldown(uid, action);
        patchUser(uid, updated);
        return updated;
      } catch (err) {
        throw new Error(describeDirectoryError(err));
      }
    },
    [patchUser],
  );

  const toggleDisabled = useCallback(
    async (uid: string, disabled: boolean, reason: string) => {
      try {
        const updated = await setUserDisabled(uid, disabled, reason);
        patchUser(uid, updated);
        return updated;
      } catch (err) {
        throw new Error(describeDirectoryError(err));
      }
    },
    [patchUser],
  );

  const removeUser = useCallback(async (uid: string) => {
    try {
      await deleteUserAccount(uid);
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } catch (err) {
      throw new Error(describeDirectoryError(err));
    }
  }, []);

  const usersMap = useMemo(() => new Map(users.map((u) => [u.uid, u])), [users]);

  return {
    users,
    usersMap,
    status,
    error,
    reload,
    refreshOne,
    adjustPoints,
    updatePenalty,
    toggleDisabled,
    removeUser,
  };
}
