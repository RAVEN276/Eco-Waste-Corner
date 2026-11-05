"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Camera, ImageUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InlineNotice, Spinner } from "@/components/ui/States";
import { WASTE_ITEMS } from "@/lib/data/items";
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_BYTES, validatePhoto } from "@/lib/photo";
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
  const inputRef = useRef<HTMLInputElement>(null);

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

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setPhotoError(problem);
      setPhoto(null);
      event.target.value = "";
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
      setPhotoError("Unggah foto bukti, atau centang pilihan tanpa foto.");
      return;
    }
    setItemError(null);
    onSubmit({ photo: skipPhoto ? null : photo, itemId });
  };

  return (
    <div className="space-y-8">
      <fieldset disabled={submitting}>
        <legend className="text-lg font-bold">Apa yang kamu buang?</legend>
        <p className="mt-1 text-sm text-muted">
          Jawabanmu dicocokkan dengan slot yang kamu pindai. Salah slot akan mengurangi poin.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {WASTE_ITEMS.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg border-2 px-3 py-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest",
                itemId === item.id
                  ? "border-forest bg-mint-soft"
                  : "border-line bg-white hover:border-leaf",
              )}
            >
              <input
                type="radio"
                name="jenis-sampah"
                className="size-5 shrink-0 accent-forest"
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
          <p role="alert" className="mt-2 text-sm font-medium text-brick">
            {itemError}
          </p>
        ) : null}
      </fieldset>

      <fieldset disabled={submitting}>
        <legend className="text-lg font-bold">Foto bukti pemilahan</legend>
        <p className="mt-1 text-sm text-muted">
          Foto sampahmu saat berada di depan slot. JPG, PNG, atau WebP, maksimal{" "}
          {MAX_PHOTO_BYTES / 1024 / 1024} MB. Foto dikecilkan otomatis sebelum disimpan.
        </p>

        <input
          ref={inputRef}
          id="foto-bukti"
          type="file"
          accept={ACCEPTED_PHOTO_TYPES.join(",")}
          capture="environment"
          onChange={onFile}
          className="sr-only"
          aria-describedby={photoError ? "foto-error" : undefined}
        />

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob preview of a local file, nothing to optimise
            <img
              src={preview}
              alt="Pratinjau foto bukti yang akan diunggah"
              width={160}
              height={160}
              className="size-40 shrink-0 rounded-xl border border-line object-cover"
            />
          ) : (
            <div
              className="flex size-40 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-white text-center text-sm text-muted"
              aria-hidden="true"
            >
              <Camera className="size-8" />
              Belum ada foto
            </div>
          )}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={submitting}
            >
              <ImageUp aria-hidden="true" className="size-4" />
              {photo ? "Ganti foto" : "Ambil atau pilih foto"}
            </Button>
            {photo ? <p className="break-all text-sm text-muted">{photo.name}</p> : null}
            <label className="flex min-h-11 items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                className="size-5 accent-forest"
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
        {photoError ? (
          <p id="foto-error" role="alert" className="mt-2 text-sm font-medium text-brick">
            {photoError}
          </p>
        ) : null}
      </fieldset>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      {submitting ? (
        <div role="status" className="flex items-center gap-3 text-sm text-muted">
          <Spinner className="text-leaf-deep" label="Mengirim" />
          Memproses foto dan menghitung poin...
        </div>
      ) : null}

      <Button size="lg" onClick={submit} disabled={submitting} className="w-full sm:w-auto">
        Kirim dan klaim poin
      </Button>
    </div>
  );
}
