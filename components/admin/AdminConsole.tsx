"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import { useAdminScans, useAdminUsers, useScanPhotoLoader } from "@/hooks/useAdminScans";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSignOut } from "@/hooks/useSignOut";
import { useUserStore } from "@/store/useUserStore";

const AdminReview = dynamic(
  () => import("@/components/admin/AdminReview").then((mod) => mod.AdminReview),
  { loading: () => <LoadingState label="Memuat konsol tinjauan" className="py-12" /> },
);

/** Ruang kerja admin: memuat scan, profil, dan foto, lalu menyerahkannya ke tampilan tinjauan. */
function AdminWorkspace() {
  const email = useUserStore((s) => s.profile?.email ?? "");
  const { scans, status, error, hasMore, loadingMore, reload, loadMore, review } = useAdminScans();
  const users = useAdminUsers(scans);
  const loadPhoto = useScanPhotoLoader();

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8 md:py-10">
      <header className="flex flex-col gap-2 border-b-2 border-rule pb-4 sm:gap-3 sm:pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="fade-up text-4xl sm:text-5xl lg:text-6xl">Tinjau hasil scan</h1>
          <p className="fade-up mt-1.5 max-w-2xl text-sm text-muted sm:mt-2 sm:text-base lg:text-lg" style={{ ["--delay" as string]: "100ms" }}>
            Periksa foto bukti dan data scan dari mahasiswa, lalu setujui agar poin masuk ke saldo pengguna atau tolak dengan alasan.
          </p>
        </div>
        {email ? (
          <p className="shrink-0 text-xs text-muted sm:text-sm">
            Admin: <strong className="break-all text-ink">{email}</strong>
          </p>
        ) : null}
      </header>

      <AdminReview
        scans={scans}
        users={users}
        status={status}
        error={error}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onReload={reload}
        onLoadMore={() => void loadMore()}
        loadPhoto={loadPhoto}
        onReview={review}
      />
    </div>
  );
}

/**
 * Penjaga halaman admin. Ini hanya mengatur tampilan: yang benar-benar menahan akses ke data adalah aturan
 * Firestore, jadi akun lain tidak akan bisa membaca scan walau penjaga ini dilewati.
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
