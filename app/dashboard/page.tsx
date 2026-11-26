"use client";

import { BadgesPanel } from "@/components/dashboard/BadgesPanel";
import { ExchangePanel } from "@/components/dashboard/ExchangePanel";
import { HistoryList } from "@/components/dashboard/HistoryList";
import { PointsCard } from "@/components/dashboard/PointsCard";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { Button } from "@/components/ui/Button";
import { ErrorState, InlineNotice, LoadingState } from "@/components/ui/States";
import { useCooldown } from "@/hooks/useCooldown";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatDateTime } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

export default function DashboardPage() {
  const authStatus = useRequireAuth();
  const profileStatus = useUserStore((s) => s.profileStatus);
  const profile = useUserStore((s) => s.profile);
  const isAdmin = useUserStore((s) => s.isAdmin);
  const error = useUserStore((s) => s.error);
  const retryProfile = useUserStore((s) => s.retryProfile);
  const cooldown = useCooldown();

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
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-7 sm:space-y-14 sm:px-6 sm:py-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="fade-up break-words text-5xl sm:text-6xl lg:text-7xl">
            Halo, {profile.nama.split(" ")[0] || "Mahasiswa UPJ"}
          </h1>
          <p className="fade-up mt-2.5 text-base text-muted sm:mt-3 sm:text-lg" style={{ ["--delay" as string]: "120ms" }}>
            Ringkasan poin, poin JSDP, dan aktivitas pemilahanmu.
          </p>
        </div>
        {isAdmin ? (
          <Button href="/admin" variant="dark" size="lg" className="w-full shrink-0 sm:w-auto">
            Buka dashboard admin
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <PointsCard />
        <ProfileCard />
      </div>

      {profile.penaltyNote ? (
        <InlineNotice tone={cooldown.active ? "error" : "warning"}>
          <p className="font-bold">
            {cooldown.active
              ? `Akun sedang dalam jeda penalti (${cooldown.label} tersisa)`
              : "Catatan penalti dari admin"}
            {profile.penaltyUpdatedAt ? ` · ${formatDateTime(profile.penaltyUpdatedAt)}` : ""}
          </p>
          <p className="mt-1 break-words">{profile.penaltyNote}</p>
        </InlineNotice>
      ) : null}

      <ExchangePanel />
      <BadgesPanel />
      <HistoryList />
    </div>
  );
}
