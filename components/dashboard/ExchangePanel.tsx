"use client";

import { useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { ExchangeRate } from "@/components/ui/ExchangeRate";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useExchangeHistory } from "@/hooks/useExchangeHistory";
import { describeFirebaseError } from "@/lib/firebase/errors";
import { submitExchange } from "@/lib/firebase/firestore";
import { EXCHANGE_POIN, exchangeQuote, maxExchangePackages } from "@/lib/scoring";
import { formatDateTime } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";

const MAX_ROWS = 5;

const STEP_BUTTON =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-ctl border-2 border-ink bg-white font-display text-4xl font-extrabold leading-none transition-[color,background-color,scale] duration-150 hover:bg-cobalt-soft active:scale-[0.98] disabled:opacity-55 disabled:hover:bg-white disabled:active:scale-100";

// Saldo sekarang, atau saldo sekarang menjadi saldo sesudah tukar. Tanpa perubahan cukup satu angka.
function Change({ before, after }: { before: number; after: number }) {
  if (before === after) {
    return (
      <dd className="font-display text-5xl font-extrabold leading-none tabular-nums">{after}</dd>
    );
  }
  return (
    <dd className="flex items-center gap-2 font-display font-extrabold leading-none tabular-nums">
      <span className="text-3xl text-muted">{before}</span>
      <span className="sr-only">menjadi</span>
      <ArrowRightIcon className="size-5" />
      <span className="text-5xl">{after}</span>
    </dd>
  );
}

// Penukaran poin ke poin JSDP. Tidak bisa dibatalkan dan menyangkut syarat kelulusan, jadi
// selalu lewat dialog konfirmasi yang menyebut angka persisnya.
export function ExchangePanel() {
  const uid = useUserStore((s) => s.profile?.uid ?? null);
  const poin = useUserStore((s) => s.poin);
  const poinJSDP = useUserStore((s) => s.poinJSDP);
  const history = useExchangeHistory();

  const [wanted, setWanted] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ spent: number; gained: number } | null>(null);

  const maxPackages = maxExchangePackages(poin);
  const packages = maxPackages === 0 ? 0 : Math.min(Math.max(wanted, 1), maxPackages);
  const { spent, gained } = exchangeQuote(packages);
  const rows = history.exchanges.slice(0, MAX_ROWS);

  // Activity keeps hidden pages mounted, so close the dialog when the page is hidden.
  useLayoutEffect(() => {
    return () => setConfirmOpen(false);
  }, []);

  function openConfirm() {
    setError(null);
    setDone(null);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (!pending) setConfirmOpen(false);
  }

  async function confirmExchange() {
    if (!uid || packages < 1) return;
    setPending(true);
    setError(null);
    try {
      const result = await submitExchange({ uid, packages });
      setDone({ spent: result.poinSpent, gained: result.jsdpGained });
      setWanted(1);
      setConfirmOpen(false);
    } catch (err) {
      setError(describeFirebaseError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="tukar-poin" aria-labelledby="judul-tukar" className="scroll-mt-24">
      <div className="grid overflow-hidden rounded-sheet border-2 border-ink bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal-l bg-ink p-6 text-white sm:p-8">
          <h2 id="judul-tukar" className="text-5xl">
            Tukar poin jadi poin JSDP
          </h2>
          <p className="mt-3 max-w-md text-mist">
            Poin JSDP (Jaya Soft Skills Development Program) adalah syarat kelulusan. Poin dari scan
            baru dihitung sebagai JSDP setelah kamu tukar.
          </p>
          <ExchangeRate className="mt-6" />
          <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-mist">
            <li>Ditukar per kelipatan {EXCHANGE_POIN} poin. Sisa poin tetap tersimpan.</li>
            <li>Penukaran tidak bisa dibatalkan, dan poin JSDP tidak bisa ditukar balik.</li>
          </ul>
        </div>

        <div className="reveal-r p-6 sm:p-8">
          <h3 className="text-3xl">Jumlah penukaran</h3>
          <div
            role="group"
            aria-label="Jumlah paket penukaran"
            className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2"
          >
            <button
              type="button"
              aria-label="Kurangi satu paket"
              onClick={() => setWanted(packages - 1)}
              disabled={packages <= 1}
              className={STEP_BUTTON}
            >
              −
            </button>
            <output aria-live="polite" className="min-w-20 text-center">
              <span className="block font-display text-6xl font-extrabold leading-none tabular-nums">
                {packages}
              </span>
              <span className="text-sm text-muted">paket</span>
            </output>
            <button
              type="button"
              aria-label="Tambah satu paket"
              onClick={() => setWanted(packages + 1)}
              disabled={packages >= maxPackages}
              className={STEP_BUTTON}
            >
              +
            </button>
            <p className="w-full text-sm text-muted sm:w-auto">1 paket = {EXCHANGE_POIN} poin</p>
          </div>

          <dl className="mt-5 divide-y-2 divide-rule border-y-2 border-rule">
            <div className="flex items-end justify-between gap-4 py-3">
              <dt className="font-bold">Poin</dt>
              <Change before={poin} after={poin - spent} />
            </div>
            <div className="flex items-end justify-between gap-4 py-3">
              <dt className="font-bold">Poin JSDP</dt>
              <Change before={poinJSDP} after={poinJSDP + gained} />
            </div>
          </dl>

          <Button
            size="lg"
            className="mt-5 w-full sm:w-auto"
            onClick={openConfirm}
            disabled={packages < 1}
          >
            {packages < 1 ? "Poin belum cukup" : `Tukar ${spent} poin jadi ${gained} JSDP`}
          </Button>

          {packages < 1 ? (
            <p className="mt-4 text-sm text-muted">
              Satu paket butuh {EXCHANGE_POIN} poin. Kurang {EXCHANGE_POIN - poin} lagi.
            </p>
          ) : null}

          <div aria-live="polite">
            {done ? (
              <p className="pop mt-5 flex items-start gap-2 rounded-ctl border-2 border-cobalt bg-cobalt-soft px-4 py-3 text-sm">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-cobalt" />
                <span>
                  Berhasil. {done.spent} poin ditukar jadi {done.gained} poin JSDP.
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="reveal mt-8">
        <h3 className="text-3xl">Riwayat penukaran</h3>
        <div className="mt-4">
          {history.status === "loading" ? (
            <LoadingState label="Memuat riwayat penukaran" />
          ) : history.status === "error" ? (
            <ErrorState
              title="Riwayat penukaran gagal dimuat"
              message={history.error ?? "Terjadi kesalahan."}
              onRetry={history.retry}
            />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Belum ada penukaran"
              description="Setiap penukaran poin ke poin JSDP akan tercatat di sini."
            />
          ) : (
            <>
              <ul className="divide-y-2 divide-rule rounded-plate border-2 border-ink bg-white">
                {rows.map((row) => (
                  <li
                    key={row.exchangeId}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3"
                  >
                    <time className="text-sm text-muted">{formatDateTime(row.timestamp)}</time>
                    <p className="flex items-center gap-3 font-display font-extrabold leading-none tabular-nums">
                      <span className="text-4xl">
                        <span className="sr-only">Menukar </span>
                        <span aria-hidden="true">-</span>
                        {row.poinSpent}
                        <span className="ml-1 text-base font-bold">poin</span>
                      </span>
                      <ArrowRightIcon className="size-5" />
                      <span className="text-4xl text-cobalt">
                        <span className="sr-only">jadi </span>
                        <span aria-hidden="true">+</span>
                        {row.jsdpGained}
                        <span className="ml-1 text-base font-bold">JSDP</span>
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
              {history.exchanges.length > MAX_ROWS ? (
                <p className="mt-3 text-sm text-muted">
                  Menampilkan {MAX_ROWS} penukaran terbaru.
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onClose={closeConfirm} title="Konfirmasi penukaran">
        <p className="text-lg">
          Kamu menukar <strong>{spent} poin</strong> jadi <strong>{gained} poin JSDP</strong>.
        </p>
        <p className="mt-2 text-sm text-muted">
          Penukaran tidak bisa dibatalkan, dan poin JSDP tidak bisa ditukar balik jadi poin.
        </p>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-ctl border-2 border-brick bg-brick-soft px-4 py-3 text-sm text-brick-ink"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={closeConfirm} disabled={pending}>
            Batal
          </Button>
          <Button onClick={confirmExchange} disabled={pending}>
            {pending ? "Memproses..." : "Tukar sekarang"}
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
