"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import { useAdminScans, useAdminUsers, useScanPhotoLoader } from "@/hooks/useAdminScans";
import { useAdminUsersDirectory } from "@/hooks/useAdminUsersDirectory";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSignOut } from "@/hooks/useSignOut";
import type { ReviewDecision } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const AdminReview = dynamic(
  () => import("@/components/admin/AdminReview").then((mod) => mod.AdminReview),
  { loading: () => <LoadingState label="Memuat konsol tinjauan" className="py-12" /> },
);

const AdminCatalog = dynamic(
  () => import("@/components/admin/AdminCatalog").then((mod) => mod.AdminCatalog),
  { loading: () => <LoadingState label="Memuat kelola kamus" className="py-12" /> },
);

const AdminUsers = dynamic(
  () => import("@/components/admin/AdminUsers").then((mod) => mod.AdminUsers),
  { loading: () => <LoadingState label="Memuat data pengguna" className="py-12" /> },
);

type AdminSection = "scans" | "catalog" | "users";

/** Ruang kerja admin: tinjauan scan, CRUD kamus serta soal acak, dan kelola pengguna. */
function AdminWorkspace() {
  const email = useUserStore((s) => s.profile?.email ?? "");
  const [section, setSection] = useState<AdminSection>("scans");
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const { scans, status, error, hasMore, loadingMore, reload, loadMore, review, removeScan, purgeUserScans } =
    useAdminScans();
  const directory = useAdminUsersDirectory();
  const fallbackUsers = useAdminUsers(scans);
  const loadPhoto = useScanPhotoLoader();

  const mergedUsersMap = useMemo(
    () => new Map([...fallbackUsers, ...directory.usersMap]),
    [fallbackUsers, directory.usersMap],
  );

  const pendingScanCount = useMemo(
    () => scans.filter((scan) => !scan.review).length,
    [scans],
  );

  const handleReview = async (scanId: string, decision: ReviewDecision, note: string) => {
    const target = scans.find((s) => s.scanId === scanId);
    const saved = await review(scanId, decision, note);
    if (target) void directory.refreshOne(target.userId);
    return saved;
  };

  const handleDeleteScan = async (scanId: string) => {
    const result = await removeScan(scanId);
    if (result.wasApproved) void directory.refreshOne(result.uid);
    return result;
  };

  const handleDeleteUser = async (uid: string) => {
    await directory.removeUser(uid);
    purgeUserScans(uid);
    if (selectedUid === uid) setSelectedUid(null);
  };

  const jumpToUser = (uid: string) => {
    setSelectedUid(uid);
    setSection("users");
  };

  const tabs: { id: AdminSection; label: string; count: number | null }[] = [
    { id: "scans", label: "Tinjau scan", count: pendingScanCount },
    { id: "catalog", label: "Kamus & soal", count: null },
    { id: "users", label: "Pengguna", count: directory.status === "ready" ? directory.users.length : null },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8 md:py-10">
      <header className="flex flex-col gap-2 border-b-2 border-rule pb-4 sm:gap-3 sm:pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="fade-up text-4xl sm:text-5xl lg:text-6xl">Konsol admin</h1>
          <p
            className="fade-up mt-1.5 max-w-2xl text-sm text-muted sm:mt-2 sm:text-base lg:text-lg"
            style={{ ["--delay" as string]: "100ms" }}
          >
            Tinjau bukti scan, tambah atau ubah kamus sampah acak, dan atur poin, penalti, serta status akun pengguna.
          </p>
        </div>
        {email ? (
          <p className="shrink-0 text-xs text-muted sm:text-sm">
            Admin: <strong className="break-all text-ink">{email}</strong>
          </p>
        ) : null}
      </header>

      <nav aria-label="Menu ruang kerja admin">
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap">
          {tabs.map((tab) => {
            const active = section === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setSection(tab.id)}
                className={cn(
                  "inline-flex min-h-12 items-center justify-between gap-2.5 rounded-plate border-2 px-4 py-2.5 text-sm font-bold transition-colors sm:justify-center sm:px-5 sm:text-base",
                  active
                    ? "border-pick bg-pick text-on-pick"
                    : "border-line bg-surface text-ink hover:bg-cobalt-soft",
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== null ? (
                  <span
                    className={cn(
                      "font-display text-xl font-extrabold leading-none tabular-nums sm:text-2xl",
                      active ? "text-on-pick" : "text-link",
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {section === "scans" ? (
        <AdminReview
          scans={scans}
          users={mergedUsersMap}
          status={status}
          error={error}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onReload={reload}
          onLoadMore={() => void loadMore()}
          loadPhoto={loadPhoto}
          onReview={handleReview}
          onDeleteScan={handleDeleteScan}
          onManageUser={jumpToUser}
        />
      ) : null}

      {section === "catalog" ? <AdminCatalog /> : null}

      {section === "users" ? (
        <AdminUsers
          users={directory.users}
          status={directory.status}
          error={directory.error}
          selectedUid={selectedUid}
          onSelectUid={setSelectedUid}
          onReload={directory.reload}
          onAdjustPoints={directory.adjustPoints}
          onUpdatePenalty={directory.updatePenalty}
          onToggleDisabled={directory.toggleDisabled}
          onDeleteUser={handleDeleteUser}
        />
      ) : null}
    </div>
  );
}

/**
 * Penjaga halaman admin. Ini hanya mengatur tampilan: yang benar-benar menahan akses ke data adalah aturan
 * Firestore, jadi akun lain tidak akan bisa membaca data admin walau penjaga ini dilewati.
 */
export function AdminConsole() {
  const authStatus = useRequireAuth();
  const isAdmin = useUserStore((s) => s.isAdmin);
  const email = useUserStore((s) => s.profile?.email ?? "");
  const signOut = useSignOut();

  if (authStatus === "initializing" || authStatus === "unauthenticated") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <LoadingState
          label={authStatus === "initializing" ? "Memeriksa sesi login" : "Mengarahkan ke halaman login"}
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-plate border-2 border-line bg-surface p-6 sm:p-8">
          <h1 className="text-4xl sm:text-5xl">Halaman ini khusus admin</h1>
          <p className="mt-3 text-lg">
            {email ? (
              <>
                Kamu masuk sebagai <strong className="break-all">{email}</strong>.{" "}
              </>
            ) : null}
            Halaman admin hanya bisa dibuka oleh akun admin yang masuk dengan Google.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/dashboard" size="lg">
              Ke dashboard
            </Button>
            <Button variant="outline" size="lg" onClick={() => void signOut()}>
              Keluar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminWorkspace />;
}
