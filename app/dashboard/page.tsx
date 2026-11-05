"use client";

import { BadgesPanel } from "@/components/dashboard/BadgesPanel";
import { HistoryList } from "@/components/dashboard/HistoryList";
import { PointsCard } from "@/components/dashboard/PointsCard";
import { ProfileCard } from "@/components/dashboard/ProfileCard";

import { ErrorState, LoadingState } from "@/components/ui/States";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useUserStore } from "@/store/useUserStore";

export default function DashboardPage() {
  const authStatus = useRequireAuth();
  const profileStatus = useUserStore((s) => s.profileStatus);
  const profile = useUserStore((s) => s.profile);
  const error = useUserStore((s) => s.error);
  const retryProfile = useUserStore((s) => s.retryProfile);

  if (authStatus === "initializing" || authStatus === "unauthenticated") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <LoadingState
          label={
            authStatus === "initializing" ? "Memeriksa sesi login" : "Mengarahkan ke halaman login"
          }
        />
      </div>
    );
  }

  if (profileStatus === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState
          title="Profil gagal dimuat"
          message={error ?? "Terjadi kesalahan."}
          onRetry={retryProfile}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <LoadingState label="Memuat profil" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:px-6 md:py-14">
      <div>
        <h1 className="text-6xl sm:text-7xl">
          Halo, {profile.nama.split(" ")[0] || "Mahasiswa UPJ"}
        </h1>
        <p className="mt-3 text-lg text-muted">Ringkasan poin dan aktivitas pemilahanmu.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <PointsCard />
        <ProfileCard />
      </div>

      <BadgesPanel />
      <HistoryList />
    </div>
  );
}
