"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ReviewDecision, ScanRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

interface ReviewFormProps {
  scan: ScanRecord;
  onReview: (decision: ReviewDecision, note: string) => Promise<void>;
}

const NOTE_LIMIT = 500;

/**
 * Bilah keputusan di dasar panel detail. Dari lebar md ia menempel di bawah layar supaya tombolnya selalu
 * terjangkau walau detailnya panjang. Di ponsel ia mengalir di ujung detail: bilah yang menempel di sana
 * memakan hampir 40% layar, dan keputusan memang diambil setelah foto, data, dan kuis dibaca.
 * Menolak wajib disertai alasan, menyetujui boleh tanpa catatan.
 */
export function ReviewForm({ scan, onReview }: ReviewFormProps) {
  const [note, setNote] = useState(scan.review?.note ?? "");
  const [pending, setPending] = useState<ReviewDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

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
      setSaved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Keputusan gagal disimpan.");
    } finally {
      setPending(null);
    }
  };

  const busy = pending !== null;
  const noteId = `catatan-${scan.scanId}`;

  return (
    <section aria-label="Keputusan tinjauan admin" className="rounded-plate border-2 border-line bg-paper p-4">
      <h3 className="text-2xl">Keputusan admin (tahap 2)</h3>

      {scan.review ? (
        <p className="mt-2 text-sm">
          <span className="font-bold">
            {scan.review.status === "approved" ? "Sudah disetujui" : "Sudah ditolak"}
          </span>{" "}
          oleh {scan.review.reviewedBy}
          {scan.review.reviewedAt ? `, ${formatDateTime(scan.review.reviewedAt)}` : ""}. Menyimpan lagi akan mengganti keputusan itu.
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
            className="mt-1 block w-full resize-y rounded-ctl border-2 border-edge bg-surface px-3 py-2 text-base"
          />
          <div aria-live="polite">
            {error ? (
              <p id={`${noteId}-galat`} role="alert" className="mt-2 text-sm font-bold text-brick-text">
                {error}
              </p>
            ) : null}
            {saved && !error ? <p className="mt-2 text-sm font-bold">Keputusan tersimpan.</p> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button size="lg" disabled={busy} onClick={() => void submit("approved")} className="w-full">
            {pending === "approved" ? "Menyimpan..." : "Setujui"}
          </Button>
          <Button variant="danger" size="lg" disabled={busy} onClick={() => void submit("rejected")} className="w-full">
            {pending === "rejected" ? "Menyimpan..." : "Tolak"}
          </Button>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        {scan.pointsEarned > 0
          ? scan.review?.status === "approved"
            ? `Scan ini sudah menyumbang +${scan.pointsEarned} poin ke saldo pengguna. Jika diubah ke Tolak, poin tersebut ditarik kembali.`
            : `Menyetujui scan ini akan menambahkan +${scan.pointsEarned} poin ke saldo pengguna. Jika ditolak, pengguna tidak mendapatkan poin tersebut.`
          : `Scan ini bernilai ${scan.pointsEarned} poin, sehingga keputusan tinjauan hanya mencatat status.`}
      </p>
    </section>
  );
}
