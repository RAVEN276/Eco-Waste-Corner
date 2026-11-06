"use client";

import { useEffect, useState } from "react";
import { CameraCapture } from "@/components/scan/CameraCapture";
import { Button } from "@/components/ui/Button";
import { CameraIcon } from "@/components/ui/Icons";
import { InlineNotice, Spinner } from "@/components/ui/States";
import { SCAN_ITEMS } from "@/lib/data/items";
import { validatePhoto } from "@/lib/photo";
import { cn } from "@/lib/utils";

interface PhotoStepProps {
  submitting: boolean;

  error: string | null;
  onSubmit: (values: { photo: File | null; itemId: string }) => void;
}

export function PhotoStep({ submitting, error, onSubmit }: PhotoStepProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [itemId, setItemId] = useState("");
  const [skipPhoto, setSkipPhoto] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);

  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL must be created after mount and revoked on cleanup
    setPreview(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreview(null);
    };
  }, [photo]);

  const onCaptured = (file: File) => {
    setCameraOpen(false);
    const problem = validatePhoto(file);
    if (problem) {
      setPhotoError(problem);
      setPhoto(null);
      return;
    }
    setPhotoError(null);
    setSkipPhoto(false);
    setPhoto(file);
  };

  const submit = () => {
    if (!itemId) {
      setItemError("Pilih jenis sampah yang kamu buang.");
      return;
    }
    if (!photo && !skipPhoto) {
      setPhotoError("Ambil foto bukti dengan kamera, atau centang pilihan tanpa foto.");
      return;
    }
    setItemError(null);
    onSubmit({ photo: skipPhoto ? null : photo, itemId });
  };

  return (
    <div className="space-y-10">
      <fieldset disabled={submitting}>
        <legend className="font-display text-3xl font-extrabold">Apa yang kamu buang?</legend>
        <p className="mt-1 text-sm text-muted">
          Jawabanmu dicocokkan dengan slot yang kamu pindai. Salah slot akan mengurangi poin.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SCAN_ITEMS.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-ctl border-2 px-3 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-link",
                itemId === item.id
                  ? "border-line bg-cobalt-soft"
                  : "border-edge bg-surface hover:bg-cobalt-soft",
              )}
            >
              <input
                type="radio"
                name="jenis-sampah"
                className="size-5 shrink-0 accent-link"
                checked={itemId === item.id}
                onChange={() => {
                  setItemId(item.id);
                  setItemError(null);
                }}
              />
              {item.label}
            </label>
          ))}
        </div>
        {itemError ? (
          <p role="alert" className="mt-2 text-sm font-bold text-brick-text">
            {itemError}
          </p>
        ) : null}
      </fieldset>

      <fieldset disabled={submitting} className="reveal">
        <legend className="font-display text-3xl font-extrabold">Foto bukti pemilahan</legend>
        <p className="mt-1 text-sm text-muted">
          Foto sampahmu langsung dengan kamera saat berada di depan tong. Foto dari galeri atau berkas tidak bisa
          dipakai. Foto dikecilkan otomatis sebelum disimpan.
        </p>

        {cameraOpen ? (
          <div className="mt-3">
            <CameraCapture
              key={cameraKey}
              onCapture={onCaptured}
              onCancel={() => setCameraOpen(false)}
              onRetry={() => setCameraKey((n) => n + 1)}
            />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob preview of a local file, nothing to optimise
              <img
                src={preview}
                alt="Pratinjau foto bukti yang akan dikirim"
                width={160}
                height={160}
                className="size-40 shrink-0 rounded-plate border-2 border-line object-cover"
              />
            ) : (
              <div
                className="flex size-40 shrink-0 flex-col items-center justify-center gap-2 rounded-plate border-2 border-dashed border-edge bg-surface text-center text-sm text-muted"
                aria-hidden="true"
              >
                <CameraIcon className="size-8" />
                Belum ada foto
              </div>
            )}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPhotoError(null);
                  setCameraOpen(true);
                }}
                disabled={submitting}
              >
                {photo ? "Foto ulang" : "Buka kamera"}
              </Button>
              <label className="flex min-h-11 items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  className="size-5 accent-link"
                  checked={skipPhoto}
                  onChange={(event) => {
                    setSkipPhoto(event.target.checked);
                    if (event.target.checked) setPhotoError(null);
                  }}
                />
                Saya tidak bisa mengambil foto (poin lebih sedikit)
              </label>
            </div>
          </div>
        )}
        {photoError ? (
          <p id="foto-error" role="alert" className="mt-2 text-sm font-bold text-brick-text">
            {photoError}
          </p>
        ) : null}
      </fieldset>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      {submitting ? (
        <div role="status" className="flex items-center gap-3 text-sm text-muted">
          <Spinner className="text-link" label="Mengirim" />
          Memproses foto dan menghitung poin...
        </div>
      ) : null}

      <Button size="lg" onClick={submit} disabled={submitting} className="reveal w-full sm:w-auto">
        Kirim dan klaim poin
      </Button>
    </div>
  );
}
