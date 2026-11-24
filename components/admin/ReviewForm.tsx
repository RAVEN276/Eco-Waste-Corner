"use client";

import { useRef, useState } from "react";
import { ReviewBadge } from "@/components/admin/ReviewBadge";
import { Button } from "@/components/ui/Button";
import type { ReviewDecision, ScanRecord } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

interface ReviewFormProps {
  scan: ScanRecord;
  onReview: (decision: ReviewDecision, note: string) => Promise<void>;
}

const NOTE_LIMIT = 500;

/**
 * Panel keputusan admin (tahap 2). Scan yang belum ditinjau langsung menampilkan formulir keputusan;
 * scan yang sudah diputuskan tampil ringkas dalam keadaan terkunci dengan tombol "Ubah keputusan".
 */
export function ReviewForm({ scan, onReview }: ReviewFormProps) {
  const [editing, setEditing] = useState(() => !scan.review);
  const [note, setNote] = useState(scan.review?.note ?? "");
  const [pending, setPending] = useState<ReviewDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const openEdit = () => {
    setNote(scan.review?.note ?? "");
    setError(null);
    setSaved(false);
    setEditing(true);
    requestAnimationFrame(() => noteRef.current?.focus());
  };

  const cancelEdit = () => {
    setNote(scan.review?.note ?? "");
    setError(null);
    setEditing(false);
  };

  const submit = async (decision: ReviewDecision) => {
    if (decision === "rejected" && note.trim() === "") {
      setError("Tulis alasan penolakan dulu, supaya jelas bagi pengguna dan peninjau berikutnya.");
      noteRef.current?.focus();
      return;
    }
    setPending(decision);
    setError(null);
    setSaved(false);
    try {
      await onReview(decision, note);
      setEditing(false);
      setSaved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Keputusan gagal disimpan.");
    } finally {
      setPending(null);
    }
  };

  const busy = pending !== null;
  const noteId = `catatan-${scan.scanId}`;
  const review = scan.review;
  const savedNote = review?.note.trim() ?? "";

  if (!editing && review) {
    const rejected = review.status === "rejected";
    return (
      <section aria-label="Keputusan tinjauan admin" className="rounded-plate border-2 border-line bg-paper p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xl sm:text-2xl">Keputusan admin (tahap 2)</h3>
          <ReviewBadge state={review.status} />
        </div>

        <p className="mt-2 break-words text-sm text-muted">
          Diputuskan oleh <strong className="break-all text-ink">{review.reviewedBy}</strong>
          {review.reviewedAt ? `, ${formatDateTime(review.reviewedAt)}` : ""}.
        </p>

        {savedNote ? (
          <div
            className={cn(
              "mt-3 rounded-ctl border-2 px-3 py-2 text-sm",
              rejected
                ? "border-brick-text bg-brick-soft text-brick-ink"
                : "border-rule bg-surface text-ink",
            )}
          >
            <p className="font-bold">{rejected ? "Alasan penolakan:" : "Catatan admin:"}</p>
            <p className="mt-0.5 break-words">{savedNote}</p>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-muted">
          {scan.pointsEarned > 0
            ? rejected
              ? `Scan ini ditolak, jadi pengguna tidak mendapatkan +${scan.pointsEarned} poin.`
              : `Scan ini disetujui dan menyumbang +${scan.pointsEarned} poin ke saldo pengguna.`
            : `Scan ini bernilai ${scan.pointsEarned} poin.`}
        </p>

        <div aria-live="polite">
          {saved ? <p className="mt-2 text-sm font-bold text-ink">Keputusan tersimpan.</p> : null}
        </div>

        <div className="mt-4">
          <Button variant="outline" onClick={openEdit} className="w-full sm:w-auto">
            Ubah keputusan
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Keputusan tinjauan admin" className="rounded-plate border-2 border-line bg-paper p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl sm:text-2xl">Keputusan admin (tahap 2)</h3>
        {review ? <ReviewBadge state={review.status} /> : null}
      </div>

      {review ? (
        <p className="mt-2 break-words text-sm text-muted">
          Keputusan saat ini oleh <span className="break-all font-bold text-ink">{review.reviewedBy}</span>
          {review.reviewedAt ? `, ${formatDateTime(review.reviewedAt)}` : ""}. Menyimpan lagi akan menggantinya.
        </p>
      ) : null}

      <div className="mt-3 space-y-3">
        <div>
          <label htmlFor={noteId} className="text-sm font-bold">
            Catatan{" "}
            <span className="font-normal text-muted">
              (wajib bila menolak, terlihat oleh pengguna di dashboard, maksimal {NOTE_LIMIT} karakter)
            </span>
          </label>
          <textarea
            id={noteId}
            ref={noteRef}
            rows={3}
            maxLength={NOTE_LIMIT}
            value={note}
            disabled={busy}
            onChange={(event) => setNote(event.target.value)}
            aria-describedby={error ? `${noteId}-galat` : undefined}
            aria-invalid={error ? true : undefined}
            className="mt-1 block w-full resize-y scroll-mt-20 rounded-ctl border-2 border-edge bg-surface px-3 py-2 text-base"
          />
          <div aria-live="polite">
            {error ? (
              <p id={`${noteId}-galat`} role="alert" className="mt-2 text-sm font-bold text-brick-text">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className={cn("grid grid-cols-1 gap-2", review ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          <Button size="lg" disabled={busy} onClick={() => void submit("approved")} className="w-full">
            {pending === "approved" ? "Menyimpan..." : "Setujui"}
          </Button>
          <Button variant="danger" size="lg" disabled={busy} onClick={() => void submit("rejected")} className="w-full">
            {pending === "rejected" ? "Menyimpan..." : "Tolak"}
          </Button>
          {review ? (
            <Button variant="outline" size="lg" disabled={busy} onClick={cancelEdit} className="w-full">
              Batal
            </Button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        {scan.pointsEarned > 0
          ? review?.status === "approved"
            ? `Scan ini sudah menyumbang +${scan.pointsEarned} poin ke saldo pengguna. Jika diubah ke Tolak, poin tersebut ditarik kembali.`
            : `Menyetujui scan ini akan menambahkan +${scan.pointsEarned} poin ke saldo pengguna. Jika ditolak, pengguna tidak mendapatkan poin tersebut.`
          : `Scan ini bernilai ${scan.pointsEarned} poin, sehingga keputusan tinjauan hanya mencatat status.`}
      </p>
    </section>
  );
}
