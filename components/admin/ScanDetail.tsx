"use client";

import { useEffect, useState } from "react";
import { ReviewBadge } from "@/components/admin/ReviewBadge";
import { ReviewForm } from "@/components/admin/ReviewForm";
import {
  STATUS_LABEL,
  binLabel,
  penaltyText,
  reviewState,
  userName,
  type ScanFacts,
} from "@/components/admin/adminLabels";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { AlertIcon, CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { InlineNotice, Spinner } from "@/components/ui/States";
import type { ReviewDecision, ScanRecord, UserProfile } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface ScanDetailProps {
  scan: ScanRecord;
  user: UserProfile | undefined;
  facts: ScanFacts;
  position: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  loadPhoto: (scanId: string) => Promise<string | null>;
  onReview: (decision: ReviewDecision, note: string) => Promise<void>;
  onOpenScan: (scanId: string) => void;
}

type PhotoState = { status: "loading" | "ready" | "missing" | "error"; url: string | null };

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-bold">{children}</dd>
    </div>
  );
}

/** Foto bukti dimuat saat panel dibuka, satu dokumen per scan. Ada keadaan memuat, tidak ada, gagal, dan ganda. */
function ScanPhoto({
  scan,
  facts,
  loadPhoto,
  onOpenScan,
}: Pick<ScanDetailProps, "scan" | "facts" | "loadPhoto" | "onOpenScan">) {
  const [photo, setPhoto] = useState<PhotoState>(() => ({
    status: facts.hasStoredPhoto ? "loading" : "missing",
    url: null,
  }));
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!facts.hasStoredPhoto) return;
    let cancelled = false;
    loadPhoto(scan.scanId)
      .then((url) => {
        if (!cancelled) setPhoto(url ? { status: "ready", url } : { status: "missing", url: null });
      })
      .catch(() => {
        if (!cancelled) setPhoto({ status: "error", url: null });
      });
    return () => {
      cancelled = true;
    };
  }, [scan.scanId, facts.hasStoredPhoto, loadPhoto, attempt]);

  const retry = () => {
    setPhoto({ status: "loading", url: null });
    setAttempt((n) => n + 1);
  };

  return (
    <div className="space-y-3">
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-plate border-2 border-line bg-paper p-2 text-center sm:p-3">
        {photo.status === "loading" ? (
          <div className="flex flex-col items-center gap-3 text-muted">
            <Spinner className="size-7 text-link" label="Memuat foto" />
            <p className="text-sm" aria-hidden="true">
              Memuat foto
            </p>
          </div>
        ) : null}

        {photo.status === "ready" && photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL dari Firestore, bukan berkas yang bisa dioptimalkan Next
          <img
            src={photo.url}
            alt="Foto bukti sampah yang dikirim pengguna"
            width={800}
            height={600}
            className="size-full rounded-ctl object-contain"
          />
        ) : null}

        {photo.status === "missing" ? (
          <div className="max-w-sm space-y-3 text-sm">
            {facts.duplicatePhoto ? (
              <>
                <p className="font-bold">Foto tidak disimpan ulang</p>
                <p className="text-muted">
                  Fotonya sama persis dengan foto di scan sebelumnya milik pengguna ini, jadi hanya scan pertama yang
                  menyimpannya.
                </p>
                {facts.originalScan ? (
                  <Button variant="outline" onClick={() => onOpenScan(facts.originalScan!.scanId)}>
                    Buka scan yang menyimpan foto ini
                  </Button>
                ) : (
                  <p className="text-muted">Scan aslinya belum ada di data yang dimuat. Muat lebih banyak scan.</p>
                )}
              </>
            ) : (
              <>
                <p className="font-bold">Tidak ada foto</p>
                <p className="text-muted">
                  {scan.photoHash === ""
                    ? "Pengguna mengirim scan ini tanpa foto bukti."
                    : "Fotonya tercatat, tetapi dokumen fotonya tidak ditemukan."}
                </p>
              </>
            )}
          </div>
        ) : null}

        {photo.status === "error" ? (
          <div className="max-w-sm space-y-3 text-sm">
            <p className="flex items-center justify-center gap-2 font-bold">
              <AlertIcon className="size-4 shrink-0 text-brick-text" />
              Foto gagal dimuat
            </p>
            <Button variant="outline" onClick={retry}>
              Coba lagi
            </Button>
          </div>
        ) : null}
      </div>

      {photo.status === "ready" ? (
        <Button variant="outline" onClick={() => setZoom(true)} className="w-full sm:w-auto">
          Perbesar foto
        </Button>
      ) : null}

      <Dialog open={zoom} onClose={() => setZoom(false)} title="Foto bukti" className="sm:max-w-3xl">
        {photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL dari Firestore, bukan berkas yang bisa dioptimalkan Next
          <img
            src={photo.url}
            alt="Foto bukti sampah yang dikirim pengguna, ukuran besar"
            width={1200}
            height={900}
            className="max-h-[calc(100dvh-13rem)] w-full rounded-ctl object-contain"
          />
        ) : null}
      </Dialog>
    </div>
  );
}

export function ScanDetail({
  scan,
  user,
  facts,
  position,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  loadPhoto,
  onReview,
  onOpenScan,
}: ScanDetailProps) {
  const penalty = penaltyText(scan);
  const name = userName(scan, user ? new Map([[scan.userId, user]]) : new Map());

  return (
    <div className="overflow-clip rounded-sheet border-2 border-line bg-surface">
      <div className="flex flex-col gap-3 border-b-2 border-line bg-paper px-3.5 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-3">
            <h2 className="text-2xl sm:text-4xl">Scan {binLabel(scan.categoryBin)}</h2>
            <ReviewBadge state={reviewState(scan)} />
          </div>
          <p className="text-xs text-muted sm:text-sm">{formatDateTime(scan.timestamp)}</p>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:items-center">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={!hasPrev}
            title="Scan sebelumnya (panah kiri)"
            className="px-3 sm:px-4"
          >
            Sebelumnya
          </Button>
          <span className="px-1 text-center text-sm font-bold tabular-nums text-muted sm:order-first sm:mr-1">
            {position} / {total}
          </span>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={!hasNext}
            title="Scan berikutnya (panah kanan)"
            className="px-3 sm:px-4"
          >
            Berikutnya
          </Button>
        </div>
      </div>

      <div className="grid gap-5 p-3.5 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
        <section aria-label="Foto bukti" className="min-w-0 space-y-2.5 lg:sticky lg:top-20 lg:space-y-3">
          <h3 className="text-xl sm:text-2xl">Foto bukti</h3>
          <ScanPhoto scan={scan} facts={facts} loadPhoto={loadPhoto} onOpenScan={onOpenScan} />
        </section>

        <div className="min-w-0 space-y-4 sm:space-y-5">
          <section className="rounded-plate border-2 border-rule bg-paper p-3.5 sm:p-4">
            <h3 className="text-xl sm:text-2xl">Mahasiswa dan lokasi</h3>
            <dl className="mt-2.5 grid gap-2.5 sm:mt-3 sm:grid-cols-2 sm:gap-3">
              <Fact label="Nama">{name}</Fact>
              <Fact label="Email">
                <span className="break-all">{user?.email || "Tidak ditemukan"}</span>
              </Fact>
              <Fact label="Program studi">{user?.prodi || "Belum diisi"}</Fact>
              <Fact label="Lokasi">{scan.locationName || scan.location}</Fact>
              <Fact label="ID scan">
                <span className="break-all font-mono text-xs">{scan.scanId}</span>
              </Fact>
            </dl>
          </section>

          <section className="rounded-plate border-2 border-rule bg-paper p-3.5 sm:p-4">
            <h3 className="text-xl sm:text-2xl">Laporan dan cek otomatis (tahap 1)</h3>
            <dl className="mt-2.5 grid gap-2.5 sm:mt-3 sm:grid-cols-2 sm:gap-3">
              <Fact label="Barang dilaporkan">{facts.itemLabel}</Fact>
              <Fact label="Tong yang dipakai">{binLabel(scan.categoryBin)}</Fact>
              <Fact label="Tong yang seharusnya">
                {facts.expectedBin ? binLabel(facts.expectedBin) : "Tidak diketahui"}
              </Fact>
              <Fact label="Kesesuaian">
                {facts.binMatches === null ? (
                  "Tidak bisa dicek"
                ) : facts.binMatches ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 shrink-0 text-organik" />
                    Sesuai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <CloseIcon className="size-4 shrink-0 text-brick-text" />
                    Tidak sesuai
                  </span>
                )}
              </Fact>
              <Fact label="Poin scan">
                <span className="font-display text-3xl font-extrabold leading-none tabular-nums">
                  {scan.pointsEarned > 0 ? `+${scan.pointsEarned}` : scan.pointsEarned}
                </span>
                {scan.pointsEarned > 0 ? (
                  <span className="mt-0.5 block font-normal text-muted">
                    {scan.review?.status === "approved"
                      ? "Sudah masuk ke saldo pengguna"
                      : scan.review?.status === "rejected"
                        ? "Ditolak, pengguna tidak mendapat poin"
                        : "Menunggu persetujuan admin"}
                  </span>
                ) : null}
              </Fact>
              <Fact label="Status tahap 1">
                {STATUS_LABEL[scan.status]}
                {penalty ? <span className="mt-0.5 block font-normal text-brick-ink">{penalty}</span> : null}
              </Fact>
            </dl>
          </section>

          <section className="space-y-2.5 sm:space-y-3">
            <h3 className="text-xl sm:text-2xl">
              Kuis: {scan.quizCorrect} dari {scan.quizTotal} benar
            </h3>
            {scan.quizAnswers ? (
              <ol className="space-y-2">
                {scan.quizAnswers.map((answer, index) => (
                  <li key={`${answer.questionId}-${index}`} className="rounded-ctl border-2 border-rule bg-surface p-3">
                    <p className="text-sm font-bold">
                      {index + 1}. {answer.question}
                    </p>
                    <p className="mt-1 flex items-start gap-2 text-sm">
                      {answer.isCorrect ? (
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-organik" />
                      ) : (
                        <CloseIcon className="mt-0.5 size-4 shrink-0 text-brick-text" />
                      )}
                      <span>
                        Jawaban pengguna: {answer.chosen}
                        <span className="sr-only">{answer.isCorrect ? " (benar)" : " (salah)"}</span>
                      </span>
                    </p>
                    {!answer.isCorrect ? (
                      <p className="mt-1 text-sm text-muted">Jawaban yang benar: {answer.correct}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : (
              <InlineNotice tone="info">
                Jawaban per soal tidak tersimpan untuk scan ini. Hanya skornya yang tercatat, karena scan ini dibuat
                sebelum jawaban mulai disimpan.
              </InlineNotice>
            )}
            <p className="text-xs text-muted">
              Jawaban dan poin dikirim dari ponsel pengguna, jadi anggap sebagai keterangan, bukan bukti. Fotonya yang
              paling bisa dipegang.
            </p>
          </section>

          <ReviewForm scan={scan} onReview={onReview} />
        </div>
      </div>
    </div>
  );
}
