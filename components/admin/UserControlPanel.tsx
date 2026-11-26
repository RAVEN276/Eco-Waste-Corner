"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { AlertIcon, CheckIcon, ClockIcon } from "@/components/ui/Icons";
import { InlineNotice } from "@/components/ui/States";
import { formatDuration } from "@/hooks/useCooldown";
import { ADMIN_EMAIL } from "@/lib/admin";
import type { PenaltyCooldownUpdate } from "@/lib/firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { cn, formatDateTime, initials } from "@/lib/utils";

interface UserControlPanelProps {
  user: UserProfile;
  onAdjustPoints: (uid: string, delta: number) => Promise<number>;
  onUpdatePenalty: (uid: string, action: PenaltyCooldownUpdate) => Promise<unknown>;
  onToggleDisabled: (uid: string, disabled: boolean, reason: string) => Promise<unknown>;
  onDeleteUser: (uid: string) => Promise<void>;
}

const PENALTY_PRESETS = [15, 30, 60];

/** Panel kelola satu akun pengguna: ubah poin, atur/bebaskan waktu penalti + catatan, nonaktifkan, atau hapus akun. */
export function UserControlPanel({
  user,
  onAdjustPoints,
  onUpdatePenalty,
  onToggleDisabled,
  onDeleteUser,
}: UserControlPanelProps) {
  const [pointAmount, setPointAmount] = useState("5");
  const [pointBusy, setPointBusy] = useState(false);
  const [pointFeedback, setPointFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const [penaltyMinutes, setPenaltyMinutes] = useState("15");
  const [penaltyNote, setPenaltyNote] = useState(user.penaltyNote ?? "");
  const [penaltyBusy, setPenaltyBusy] = useState(false);
  const [penaltyFeedback, setPenaltyFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const [disableReason, setDisableReason] = useState(user.disabledReason ?? "");
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useLayoutEffect(() => {
    return () => setDeleteConfirmOpen(false);
  }, []);

  const remainingMs =
    user.cooldownUntil !== null && now !== null ? Math.max(0, user.cooldownUntil - now) : 0;
  const hasActiveCooldown = remainingMs > 0;
  const isSelfAdmin = user.email.toLowerCase() === ADMIN_EMAIL;

  const parsedPoints = Number.parseInt(pointAmount, 10);
  const validPoints = Number.isFinite(parsedPoints) && parsedPoints > 0;
  const previewAdd = validPoints ? user.poin + parsedPoints : user.poin;
  const previewSub = validPoints ? Math.max(0, user.poin - parsedPoints) : user.poin;

  const parsedMinutes = Number.parseInt(penaltyMinutes, 10);
  const validMinutes = Number.isFinite(parsedMinutes) && parsedMinutes >= 1 && parsedMinutes <= 1440;

  const handlePoints = async (sign: 1 | -1) => {
    if (!validPoints) {
      setPointFeedback({ tone: "error", text: "Masukkan angka poin minimal 1." });
      return;
    }
    setPointBusy(true);
    setPointFeedback(null);
    try {
      const next = await onAdjustPoints(user.uid, sign * parsedPoints);
      setPointFeedback({
        tone: "success",
        text: sign > 0 ? `Poin ditambah. Saldo sekarang ${next} poin.` : `Poin dikurangi. Saldo sekarang ${next} poin.`,
      });
    } catch (err) {
      setPointFeedback({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah saldo poin.",
      });
    } finally {
      setPointBusy(false);
    }
  };

  const handleAddPenalty = async () => {
    if (!validMinutes) {
      setPenaltyFeedback({ tone: "error", text: "Durasi penalti harus antara 1 sampai 1440 menit." });
      return;
    }
    if (!penaltyNote.trim()) {
      setPenaltyFeedback({ tone: "error", text: "Tulis catatan penalti agar pengguna mengetahui alasannya." });
      return;
    }
    setPenaltyBusy(true);
    setPenaltyFeedback(null);
    try {
      await onUpdatePenalty(user.uid, { mode: "add", minutes: parsedMinutes, note: penaltyNote.trim() });
      setPenaltyFeedback({
        tone: "success",
        text: `Waktu penalti +${parsedMinutes} menit dan catatan penalti telah diterapkan ke akun.`,
      });
    } catch (err) {
      setPenaltyFeedback({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal menerapkan waktu penalti.",
      });
    } finally {
      setPenaltyBusy(false);
    }
  };

  const handleClearPenalty = async () => {
    setPenaltyBusy(true);
    setPenaltyFeedback(null);
    try {
      await onUpdatePenalty(user.uid, { mode: "clear" });
      setPenaltyNote("");
      setPenaltyFeedback({
        tone: "success",
        text: "Waktu penalti dan catatan penalti dibebaskan. Pengguna bisa scan lagi sekarang.",
      });
    } catch (err) {
      setPenaltyFeedback({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal membebaskan waktu penalti.",
      });
    } finally {
      setPenaltyBusy(false);
    }
  };

  const handleToggleDisabled = async () => {
    const nextDisabled = !user.disabled;
    setAccountBusy(true);
    setAccountFeedback(null);
    try {
      await onToggleDisabled(user.uid, nextDisabled, nextDisabled ? disableReason : "");
      if (!nextDisabled) setDisableReason("");
      setAccountFeedback({
        tone: "success",
        text: nextDisabled
          ? "Akun dinonaktifkan. Pengguna otomatis keluar dan tidak bisa melakukan scan atau tukar poin."
          : "Akun diaktifkan kembali dan bisa masuk seperti biasa.",
      });
    } catch (err) {
      setAccountFeedback({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal mengubah status akun.",
      });
    } finally {
      setAccountBusy(false);
    }
  };

  const handleDelete = async () => {
    setAccountBusy(true);
    setAccountFeedback(null);
    try {
      await onDeleteUser(user.uid);
      setDeleteConfirmOpen(false);
    } catch (err) {
      setAccountFeedback({
        tone: "error",
        text: err instanceof Error ? err.message : "Gagal menghapus akun pengguna.",
      });
      setDeleteConfirmOpen(false);
    } finally {
      setAccountBusy(false);
    }
  };

  return (
    <div id="panel-kelola-pengguna" className="scroll-mt-20 space-y-5 rounded-sheet border-2 border-line bg-surface p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-rule pb-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-ctl bg-cobalt font-display text-2xl font-extrabold text-white sm:size-14 sm:text-3xl"
          >
            {initials(user.nama || user.email)}
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-2xl sm:text-3xl">{user.nama || "Pengguna tanpa nama"}</h3>
            <p className="break-all text-xs text-muted sm:text-sm">{user.email}</p>
            <p className="mt-0.5 text-xs text-muted">{user.prodi || "Program studi belum diisi"}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-ctl border-2 px-2.5 py-1 text-xs font-bold",
              user.disabled
                ? "border-brick-text bg-brick-soft text-brick-ink"
                : "border-organik bg-organik-soft text-ink",
            )}
          >
            {user.disabled ? <AlertIcon className="size-3.5 shrink-0 text-brick-text" /> : <CheckIcon className="size-3.5 shrink-0 text-organik" />}
            {user.disabled ? "Akun nonaktif" : "Akun aktif"}
          </span>
          {hasActiveCooldown ? (
            <span className="inline-flex items-center gap-1.5 rounded-ctl border-2 border-line bg-kertas-soft px-2.5 py-1 text-xs font-bold text-ink">
              <ClockIcon className="size-3.5 shrink-0" />
              Jeda {formatDuration(remainingMs)}
            </span>
          ) : null}
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center sm:gap-3">
        <div className="rounded-plate border-2 border-rule bg-paper p-3">
          <dt className="text-xs text-muted">Poin</dt>
          <dd className="mt-1 font-display text-3xl font-extrabold leading-none tabular-nums sm:text-4xl">
            {user.poin}
          </dd>
        </div>
        <div className="rounded-plate border-2 border-rule bg-paper p-3">
          <dt className="text-xs text-muted">Poin JSDP</dt>
          <dd className="mt-1 font-display text-3xl font-extrabold leading-none tabular-nums text-link sm:text-4xl">
            {user.poinJSDP}
          </dd>
        </div>
        <div className="rounded-plate border-2 border-rule bg-paper p-3">
          <dt className="text-xs text-muted">Total scan</dt>
          <dd className="mt-1 font-display text-3xl font-extrabold leading-none tabular-nums sm:text-4xl">
            {user.totalScan}
          </dd>
        </div>
      </dl>

      <section aria-labelledby="judul-atur-poin" className="space-y-3 rounded-plate border-2 border-rule bg-paper p-3.5 sm:p-4">
        <h4 id="judul-atur-poin" className="font-display text-xl font-extrabold sm:text-2xl">
          Tambah atau kurangi poin
        </h4>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-end">
          <div>
            <label htmlFor={`poin-delta-${user.uid}`} className="block text-sm font-bold">
              Jumlah poin
            </label>
            <input
              id={`poin-delta-${user.uid}`}
              type="number"
              min={1}
              step={1}
              value={pointAmount}
              disabled={pointBusy}
              onChange={(e) => setPointAmount(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3 text-base font-bold tabular-nums"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={pointBusy || !validPoints} onClick={() => void handlePoints(1)}>
              Tambah ({previewAdd})
            </Button>
            <Button
              variant="outline"
              disabled={pointBusy || !validPoints || user.poin === 0}
              onClick={() => void handlePoints(-1)}
            >
              Kurangi ({previewSub})
            </Button>
          </div>
        </div>
        {pointFeedback ? <InlineNotice tone={pointFeedback.tone}>{pointFeedback.text}</InlineNotice> : null}
      </section>

      <section aria-labelledby="judul-atur-penalti" className="space-y-3 rounded-plate border-2 border-rule bg-paper p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 id="judul-atur-penalti" className="font-display text-xl font-extrabold sm:text-2xl">
            Waktu penalti & catatan pengguna
          </h4>
          {hasActiveCooldown && user.cooldownUntil ? (
            <span className="text-xs font-bold text-brick-ink">
              Sisa {formatDuration(remainingMs)} (hingga {formatDateTime(user.cooldownUntil)})
            </span>
          ) : (
            <span className="text-xs text-muted">Tidak ada jeda aktif</span>
          )}
        </div>

        {user.penaltyNote ? (
          <InlineNotice tone={hasActiveCooldown ? "error" : "warning"}>
            <p className="font-bold">Catatan aktif pada akun:</p>
            <p className="mt-0.5 break-words">{user.penaltyNote}</p>
          </InlineNotice>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor={`penalti-menit-${user.uid}`} className="block text-sm font-bold">
            Durasi penalti (menit)
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PENALTY_PRESETS.map((mins) => (
              <button
                key={mins}
                type="button"
                disabled={penaltyBusy}
                onClick={() => setPenaltyMinutes(String(mins))}
                className={cn(
                  "min-h-11 rounded-ctl border-2 px-3 text-sm font-bold tabular-nums transition-colors",
                  penaltyMinutes === String(mins)
                    ? "border-pick bg-pick text-on-pick"
                    : "border-edge bg-surface text-ink hover:bg-cobalt-soft",
                )}
              >
                +{mins} mnt
              </button>
            ))}
            <input
              id={`penalti-menit-${user.uid}`}
              type="number"
              min={1}
              max={1440}
              value={penaltyMinutes}
              disabled={penaltyBusy}
              aria-label="Durasi penalti dalam menit"
              onChange={(e) => setPenaltyMinutes(e.target.value)}
              className="min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3 text-center text-base font-bold tabular-nums"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`penalti-catatan-${user.uid}`} className="block text-sm font-bold">
            Catatan untuk pengguna
          </label>
          <textarea
            id={`penalti-catatan-${user.uid}`}
            rows={2}
            maxLength={500}
            value={penaltyNote}
            disabled={penaltyBusy}
            onChange={(e) => setPenaltyNote(e.target.value)}
            placeholder="Contoh: Mengirim foto yang sama berulang kali di spot A."
            className="mt-1 block w-full resize-y rounded-ctl border-2 border-edge bg-surface px-3 py-2 text-base"
          />
          <p className="mt-1 text-xs text-muted">Ditampilkan di dashboard dan halaman scan pengguna.</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="dark" disabled={penaltyBusy} onClick={() => void handleAddPenalty()}>
            {penaltyBusy ? "Memproses..." : `Terapkan (+${validMinutes ? parsedMinutes : "?"} mnt)`}
          </Button>
          <Button
            variant="outline"
            disabled={penaltyBusy || (!hasActiveCooldown && !user.penaltyNote)}
            onClick={() => void handleClearPenalty()}
          >
            Bebaskan penalti
          </Button>
        </div>

        {penaltyFeedback ? <InlineNotice tone={penaltyFeedback.tone}>{penaltyFeedback.text}</InlineNotice> : null}
      </section>

      <section aria-labelledby="judul-zona-akun" className="space-y-3 rounded-plate border-2 border-rule bg-paper p-3.5 sm:p-4">
        <h4 id="judul-zona-akun" className="font-display text-xl font-extrabold sm:text-2xl">
          Status akun & penghapusan
        </h4>

        {isSelfAdmin ? (
          <p className="text-sm text-muted">
            Akun admin utama tidak dapat dinonaktifkan atau dihapus dari panel ini.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor={`alasan-nonaktif-${user.uid}`} className="block text-sm font-bold">
                Alasan penonaktifan (opsional)
              </label>
              <input
                id={`alasan-nonaktif-${user.uid}`}
                type="text"
                maxLength={300}
                value={disableReason}
                disabled={accountBusy || Boolean(user.disabled)}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="Contoh: Penyalahgunaan foto berulang"
                className="mt-1 min-h-11 w-full rounded-ctl border-2 border-edge bg-surface px-3.5 text-base disabled:opacity-65"
              />
              <p className="mt-1 text-xs text-muted">Ditampilkan ke pengguna bila akun dinonaktifkan.</p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant={user.disabled ? "primary" : "outline"}
                disabled={accountBusy}
                onClick={() => void handleToggleDisabled()}
              >
                {accountBusy ? "Memproses..." : user.disabled ? "Aktifkan akun" : "Nonaktifkan akun"}
              </Button>
              <Button
                variant="danger"
                disabled={accountBusy}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Hapus akun
              </Button>
            </div>
          </>
        )}

        {accountFeedback ? <InlineNotice tone={accountFeedback.tone}>{accountFeedback.text}</InlineNotice> : null}
      </section>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !accountBusy && setDeleteConfirmOpen(false)}
        title="Hapus akun dan seluruh datanya?"
      >
        <div className="space-y-4">
          <p className="text-base">
            Profil <strong>{user.nama || user.email}</strong> beserta seluruh riwayat scan, foto bukti, dan catatan
            penukaran poin miliknya di Firestore akan dihapus permanen.
          </p>
          <p className="text-sm text-muted">
            Tindakan ini tidak dapat dibatalkan. Kredensial masuk Firebase Authentication tidak ikut dihapus dari sisi
            aplikasi; gunakan opsi Nonaktifkan akun bila hanya ingin memblokir akses.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={accountBusy}>
              Batal
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()} disabled={accountBusy}>
              {accountBusy ? "Menghapus..." : "Ya, hapus permanen"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
