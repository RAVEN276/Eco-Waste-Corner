"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CameraIcon } from "@/components/ui/Icons";
import { InlineNotice, Spinner } from "@/components/ui/States";
import { BINS } from "@/lib/data/bins";
import { SCAN_ITEMS, findWasteItem } from "@/lib/data/items";
import { SUGGEST_THRESHOLD, guessWasteItem } from "@/lib/ml/classify";
import { ACCEPTED_PHOTO_TYPES, validatePhoto } from "@/lib/photo";
import type { BinCategory, MlSuggestion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PhotoStepProps {
  category: BinCategory;
  submitting: boolean;

  error: string | null;
  onSubmit: (values: { photo: File | null; itemId: string; mlSuggestion: MlSuggestion | null }) => void;
}

type Guess =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: Omit<MlSuggestion, "accepted"> }
  | { status: "error" };

export function PhotoStep({ category, submitting, error, onSubmit }: PhotoStepProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [itemId, setItemId] = useState("");
  const [skipPhoto, setSkipPhoto] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [guess, setGuess] = useState<Guess>({ status: "idle" });
  const [autoPicked, setAutoPicked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemIdRef = useRef("");
  const autoPickedRef = useRef(false);
  const guessToken = useRef(0);

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

  useEffect(() => {
    const tokens = guessToken;
    return () => {
      tokens.current += 1;
    };
  }, []);

  const chooseItem = (id: string, auto: boolean) => {
    itemIdRef.current = id;
    autoPickedRef.current = auto;
    setItemId(id);
    setAutoPicked(auto);
  };

  const startGuess = (file: File) => {
    const token = ++guessToken.current;
    if (autoPickedRef.current) chooseItem("", false);
    setGuess({ status: "loading" });
    guessWasteItem(file)
      .then((result) => {
        if (token !== guessToken.current) return;
        setGuess({ status: "done", result });
        const suggestedItem = result.suggested && result.itemId ? findWasteItem(result.itemId) : undefined;
        if (suggestedItem && suggestedItem.category === category && !itemIdRef.current) {
          chooseItem(suggestedItem.id, true);
          setItemError(null);
        }
      })
      .catch(() => {
        if (token === guessToken.current) setGuess({ status: "error" });
      });
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setPhotoError(problem);
      setPhoto(null);
      guessToken.current += 1;
      setGuess({ status: "idle" });
      event.target.value = "";
      return;
    }
    setPhotoError(null);
    setSkipPhoto(false);
    setPhoto(file);
    startGuess(file);
  };

  const submit = () => {
    if (!itemId) {
      setItemError("Pilih jenis sampah yang kamu buang.");
      return;
    }
    if (!photo && !skipPhoto) {
      setPhotoError("Ambil foto bukti dengan kamera ponsel, atau centang pilihan tanpa foto.");
      return;
    }
    setItemError(null);
    const usePhoto = skipPhoto ? null : photo;
    const mlSuggestion =
      usePhoto && guess.status === "done"
        ? { ...guess.result, accepted: guess.result.suggested && guess.result.itemId === itemId }
        : null;
    onSubmit({ photo: usePhoto, itemId, mlSuggestion });
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
                  chooseItem(item.id, false);
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
          Kamera ponselmu akan terbuka. Foto sampahmu langsung saat berada di depan tong. Foto dikecilkan otomatis
          sebelum disimpan.
        </p>

        {/* Kamera ponsel terbuka langsung berkat capture. Browser desktop tetap menampilkan pemilih berkas. */}
        <input
          ref={inputRef}
          id="foto-bukti"
          type="file"
          accept={ACCEPTED_PHOTO_TYPES.join(",")}
          capture="environment"
          onChange={onFile}
          tabIndex={-1}
          className="sr-only"
          aria-describedby={photoError ? "foto-error" : undefined}
        />

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
            <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={submitting}>
              {photo ? "Foto ulang" : "Buka kamera ponsel"}
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
        {photoError ? (
          <p id="foto-error" role="alert" className="mt-2 text-sm font-bold text-brick-text">
            {photoError}
          </p>
        ) : null}
        {photo && !skipPhoto ? <GuessNotice guess={guess} itemId={itemId} autoPicked={autoPicked} category={category} /> : null}
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

/** Status pengenal foto. Hanya saran: pilihan jenis sampah tetap bisa diganti dan scan tidak menunggu tebakan. */
function GuessNotice({
  guess,
  itemId,
  autoPicked,
  category,
}: {
  guess: Guess;
  itemId: string;
  autoPicked: boolean;
  category: BinCategory;
}) {
  if (guess.status === "idle") return null;
  if (guess.status === "loading") {
    return (
      <div role="status" className="mt-3 flex items-center gap-3 text-sm text-muted">
        <Spinner className="text-link" label="Mengenali" />
        Mengenali sampah di foto. Pertama kali bisa agak lama karena pengenalnya diunduh dulu.
      </div>
    );
  }
  if (guess.status === "error") {
    return (
      <InlineNotice className="mt-3">
        Pengenal otomatis tidak bisa dimuat. Pilih jenis sampah sendiri di atas.
      </InlineNotice>
    );
  }

  const { result } = guess;
  const suggestion = result.itemId ? findWasteItem(result.itemId) : undefined;
  const percent = Math.round(result.confidence * 100);
  const chosen = itemId ? findWasteItem(itemId) : undefined;

  const otherBin = result.binId && result.binId !== category && result.confidence >= SUGGEST_THRESHOLD ? result.binId : null;
  if (otherBin) {
    const looksLike = result.suggested && suggestion ? suggestion.label : `sampah ${BINS[otherBin].label}`;
    return (
      <InlineNotice tone="warning" className="mt-3">
        {`Foto terlihat seperti ${looksLike} (yakin ${percent}%), yang masuk tong ${BINS[otherBin].label}. `}
        {`Kamu memindai tong ${BINS[category].label}, jadi cek lagi sampahmu sebelum dibuang.`}
        {chosen ? ` Pilihanmu tetap ${chosen.label}.` : " Pilih jenis sampah di atas."}
      </InlineNotice>
    );
  }

  if (!result.suggested || !suggestion) {
    return (
      <InlineNotice className="mt-3">
        Jenis sampah di foto belum bisa dikenali dengan yakin. Pilih sendiri di atas.
      </InlineNotice>
    );
  }
  if (itemId === suggestion.id) {
    return (
      <InlineNotice className="mt-3">
        {autoPicked
          ? `Tebakan otomatis: ${suggestion.label} (yakin ${percent}%). Pilihan di atas sudah diisi, ganti kalau salah.`
          : `Foto cocok dengan pilihanmu: ${suggestion.label} (yakin ${percent}%).`}
      </InlineNotice>
    );
  }
  return (
    <InlineNotice className="mt-3">
      {`Foto terlihat seperti ${suggestion.label} (yakin ${percent}%).`}
      {chosen ? ` Pilihanmu tetap ${chosen.label}.` : " Pilih jenis sampah di atas."}
    </InlineNotice>
  );
}
