"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { UserControlPanel } from "@/components/admin/UserControlPanel";
import { Button } from "@/components/ui/Button";
import { RefreshIcon } from "@/components/ui/Icons";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import type { AdminStatus } from "@/hooks/useAdminScans";
import type { PenaltyCooldownUpdate } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type UserFilter = "all" | "active" | "penalized" | "disabled";

interface AdminUsersProps {
  users: UserProfile[];
  status: AdminStatus;
  error: string | null;
  selectedUid: string | null;
  onSelectUid: (uid: string) => void;
  onReload: () => void;
  onAdjustPoints: (uid: string, delta: number) => Promise<number>;
  onUpdatePenalty: (uid: string, action: PenaltyCooldownUpdate) => Promise<unknown>;
  onToggleDisabled: (uid: string, disabled: boolean, reason: string) => Promise<unknown>;
  onDeleteUser: (uid: string) => Promise<void>;
}

/** Ruang kerja pengelolaan pengguna: daftar pencarian + panel ubah poin, waktu penalti, nonaktifkan, dan hapus. */
export function AdminUsers({
  users,
  status,
  error,
  selectedUid,
  onSelectUid,
  onReload,
  onAdjustPoints,
  onUpdatePenalty,
  onToggleDisabled,
  onDeleteUser,
}: AdminUsersProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [now, setNow] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);

  const isPenalized = (user: UserProfile) =>
    now !== null && user.cooldownUntil !== null && user.cooldownUntil > now;

  const counts = useMemo(() => {
    let active = 0;
    let penalized = 0;
    let disabled = 0;
    for (const u of users) {
      if (u.disabled) disabled += 1;
      else active += 1;
      if (u.cooldownUntil !== null && now !== null && u.cooldownUntil > now) penalized += 1;
    }
    return { all: users.length, active, penalized, disabled };
  }, [users, now]);

  const needle = query.trim().toLowerCase();
  const visible = useMemo(() => {
    return users.filter((u) => {
      if (filter === "active" && u.disabled) return false;
      if (filter === "disabled" && !u.disabled) return false;
      if (filter === "penalized" && !(now !== null && u.cooldownUntil !== null && u.cooldownUntil > now)) {
        return false;
      }
      if (!needle) return true;
      return `${u.nama} ${u.email} ${u.prodi} ${u.uid}`.toLowerCase().includes(needle);
    });
  }, [users, filter, needle, now]);

  const activeUser = useMemo(() => {
    if (visible.length === 0) return null;
    const found = selectedUid ? visible.find((u) => u.uid === selectedUid) : null;
    return found ?? visible[0];
  }, [visible, selectedUid]);

  const pickUser = (uid: string) => {
    onSelectUid(uid);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }),
      );
    }
  };

  if (status === "loading") {
    return <LoadingState label="Memuat daftar pengguna" className="py-16" />;
  }

  if (status === "error") {
    return (
      <ErrorState
        title="Daftar pengguna gagal dimuat"
        message={error ?? "Terjadi kesalahan."}
        onRetry={onReload}
        className="py-12"
      />
    );
  }

  const filterTabs: { id: UserFilter; label: string }[] = [
    { id: "all", label: `Semua (${counts.all})` },
    { id: "active", label: `Aktif (${counts.active})` },
    { id: "penalized", label: `Penalti (${counts.penalized})` },
    { id: "disabled", label: `Nonaktif (${counts.disabled})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl sm:text-4xl">Pengguna ({users.length})</h2>
          <p className="mt-1 text-sm text-muted">
            Pilih akun untuk menambah atau mengurangi poin, mengatur waktu serta catatan penalti, menonaktifkan, atau menghapus data akun.
          </p>
        </div>
        <Button variant="outline" onClick={onReload} className="w-full sm:w-auto sm:shrink-0">
          <RefreshIcon className="size-4" />
          Muat ulang
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label htmlFor="cari-pengguna-admin" className="text-sm font-bold">
            Cari pengguna
          </label>
          <input
            id="cari-pengguna-admin"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nama, email, atau program studi"
            autoComplete="off"
            className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3.5 text-base"
          />
        </div>
        <div role="group" aria-label="Saring status pengguna" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {filterTabs.map((tab) => {
            const selected = tab.id === filter;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "min-h-11 rounded-ctl border-2 px-3 text-sm font-bold transition-colors",
                  selected
                    ? "border-pick bg-pick text-on-pick"
                    : "border-edge bg-surface text-ink hover:bg-cobalt-soft",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Tidak ada pengguna yang cocok"
          description="Coba kata kunci lain atau pilih saringan Semua."
          action={
            query || filter !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Lihat semua pengguna
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] lg:items-start">
          <ul className="order-2 space-y-2.5 lg:order-1">
            {visible.map((user) => {
              const selected = activeUser?.uid === user.uid;
              const penalized = isPenalized(user);
              return (
                <li key={user.uid}>
                  <button
                    type="button"
                    aria-current={selected ? "true" : undefined}
                    onClick={() => pickUser(user.uid)}
                    className={cn(
                      "flex min-h-11 w-full flex-col gap-1.5 rounded-plate border-2 p-3.5 text-left transition-colors",
                      selected
                        ? "border-pick bg-pick text-on-pick"
                        : "border-line bg-surface text-ink hover:bg-cobalt-soft",
                    )}
                  >
                    <span className="flex w-full items-start justify-between gap-3">
                      <span className="min-w-0 break-words font-bold">{user.nama || "Pengguna tanpa nama"}</span>
                      <span className="shrink-0 font-display text-2xl font-extrabold leading-none tabular-nums">
                        {user.poin} poin
                      </span>
                    </span>
                    <span className={cn("break-all text-xs", selected ? "text-mist" : "text-muted")}>
                      {user.email}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs font-bold">
                      {user.disabled ? (
                        <span className="rounded-ctl border-2 border-brick-text bg-brick-soft px-2 py-0.5 text-brick-ink">
                          Nonaktif
                        </span>
                      ) : null}
                      {penalized ? (
                        <span className="rounded-ctl border-2 border-line bg-kertas-soft px-2 py-0.5 text-ink">
                          Penalti aktif
                        </span>
                      ) : null}
                      <span className={cn("font-normal", selected ? "text-mist" : "text-muted")}>
                        {user.prodi || "Prodi belum diisi"} · {user.totalScan} scan
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div ref={panelRef} className="order-1 min-w-0 lg:sticky lg:top-20 lg:order-2">
            {activeUser ? (
              <UserControlPanel
                key={activeUser.uid}
                user={activeUser}
                onAdjustPoints={onAdjustPoints}
                onUpdatePenalty={onUpdatePenalty}
                onToggleDisabled={onToggleDisabled}
                onDeleteUser={onDeleteUser}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
