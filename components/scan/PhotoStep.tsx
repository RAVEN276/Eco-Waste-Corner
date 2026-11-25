"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ProofCamera } from "@/components/scan/ProofCamera";
import { Button } from "@/components/ui/Button";
import { CameraIcon } from "@/components/ui/Icons";
import { InlineNotice, Spinner } from "@/components/ui/States";
import { usePageVisible } from "@/hooks/usePageVisible";
import { BINS } from "@/lib/data/bins";
import { SCAN_ITEMS, findWasteItem } from "@/lib/data/items";
import { MAX_BLOCKED_TRIES, binVerdict, guessWasteItem } from "@/lib/ml/classify";
import { validatePhoto } from "@/lib/photo";
import { NO_PHOTO_QUIZ_FULL_POINTS } from "@/lib/scoring";
import type { BinCategory, MlSuggestion } from "@/lib/types";
import { cn } from "@/lib/utils";

const GUESS_WAIT_MS = 20_000;

interface PhotoStepProps {
  category: BinCategory;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: { photo: File | null; itemId: string; mlSuggestion: MlSuggestion | null }) => void;
}

type Guess =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: Omit<MlSuggestion, "accepted" | "blockedTries"> }
  | { status: "error" };

export function PhotoStep({ category, submitting, error, onSubmit }: PhotoStepProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [itemId, setItemId] = useState("");
  const [skipPhoto, setSkipPhoto] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [guess, setGuess] = useState<Guess>({ status: "idle" });
  const [autoPicked, setAutoPicked] = useState(false);
  const [blockedTries, setBlockedTries] = useState(0);
  const pageVisible = usePageVisible();
  const itemIdRef = useRef("");
  const autoPickedRef = useRef(false);
  const guessToken = useRef(0);
  const guessStartedAt = useRef(0);

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

  const resetSelectedPhoto = () => {
    setPhoto(null);
    guessToken.current += 1;
    setGuess({ status: "idle" });
  };

  const startGuess = (file: File, startedAt: number) => {
    const token = ++guessToken.current;
    if (autoPickedRef.current) chooseItem("", false);
    setGuess({ status: "loading" });
    guessStartedAt.current = startedAt;
    guessWasteItem(file)
      .then((result) => {
        if (token !== guessToken.current) return;
        setGuess({ status: "done", result });
        setPhotoError(null);
        if (binVerdict(result, category) === "block") {
          setBlockedTries((tries) => Math.min(tries + 1, MAX_BLOCKED_TRIES));
          setSkipPhoto(false);
        }
        const suggestedItem = result.suggested && result.itemId ? findWasteItem(result.itemId) : undefined;
        if (suggestedItem && suggestedItem.category === category && !itemIdRef.current) {
          chooseItem(suggestedItem.id, true);
          setItemError(null);
        }
      })
      .catch(() => {
        if (token !== guessToken.current) return;
        setGuess({ status: "error" });
        setPhotoError(null);
      });
  };

  const handleCapture = (file: File, capturedAt: number) => {
    const problem = validatePhoto(file);
    if (problem) {
      setPhotoError(problem);
      resetSelectedPhoto();
      return;
    }
    setCameraOpen(false);
    setPhotoError(null);
    setSkipPhoto(false);
    setPhoto(file);
    startGuess(file, capturedAt);
  };

  const handleOpenCamera = () => {
    if (submitting || skipPhoto) return;
    setPhotoError(null);
    setCameraOpen(true);
  };

  const handleSkipPhotoChange = (checked: boolean) => {
    setSkipPhoto(checked);
    if (!checked) return;
    setCameraOpen(false);
    setPhotoError(null);
    resetSelectedPhoto();
    if (autoPickedRef.current) chooseItem("", false);
  };

  const blocked =
    Boolean(photo) && !skipPhoto && guess.status === "done" && binVerdict(guess.result, category) === "block";

  const submit = (event: MouseEvent<HTMLButtonElement>) => {
    if (blocked) return;
    if (photo && !skipPhoto && guess.status === "loading" && event.timeStamp - guessStartedAt.current < GUESS_WAIT_MS) {
      setPhotoError("Sampah di foto masih dikenali. Tunggu sebentar, lalu tekan kirim lagi.");
      return;
    }
    if (!itemId) {
      setItemError("Pilih jenis sampah yang kamu buang.");
      return;
    }
    if (!photo && !skipPhoto) {
      setPhotoError("Ambil foto bukti dengan kamera, atau centang pilihan tanpa foto.");
      return;
    }
    setItemError(null);
    const usePhoto = skipPhoto ? null : photo;
    const mlSuggestion =
      usePhoto && guess.status === "done"
        ? { ...guess.result, accepted: guess.result.suggested && guess.result.itemId === itemId, blockedTries }
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

      <fieldset disabled={submitting} className="reveal space-y-4">
        <div>
          <legend className="font-display text-3xl font-extrabold">Foto bukti pemilahan</legend>
          <p className="mt-1 text-sm text-muted">
            Foto sampahmu langsung lewat kamera di bawah saat berada di depan tong. Foto dikenali otomatis dan
            dikecilkan sebelum disimpan.
          </p>
        </div>

        {cameraOpen && !skipPhoto && pageVisible ? (
          <ProofCamera
            key={cameraKey}
            disabled={submitting}
            onCapture={handleCapture}
            onCancel={() => setCameraOpen(false)}
            onError={(message) => setPhotoError(message)}
            onRetry={() => setCameraKey((n) => n + 1)}
          />
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob preview of a captured frame, nothing to optimise
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
              <Button variant="outline" onClick={handleOpenCamera} disabled={submitting || skipPhoto}>
                {photo ? "Foto ulang" : "Buka kamera"}
              </Button>
              <label className={cn("flex min-h-11 items-center gap-2.5 text-sm", blockedTries > 0 && "text-muted")}>
                <input
                  type="checkbox"
                  className="size-5 accent-link"
                  checked={skipPhoto}
                  disabled={submitting || blockedTries > 0}
                  onChange={(event) => handleSkipPhotoChange(event.target.checked)}
                />
                Saya tidak bisa mengambil foto (hanya {NO_PHOTO_QUIZ_FULL_POINTS} poin jika kuis benar semua)
              </label>
              {blockedTries > 0 ? (
                <p className="text-sm text-muted">Pilihan tanpa foto tidak tersedia setelah foto tidak sesuai tong.</p>
              ) : null}
            </div>
          </div>
        )}

        {photoError ? (
          <p id="foto-error" role="alert" className="text-sm font-bold text-brick-text">
            {photoError}
          </p>
        ) : null}
        {photo && !skipPhoto ? (
          <GuessNotice guess={guess} itemId={itemId} autoPicked={autoPicked} category={category} />
        ) : null}
      </fieldset>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      {submitting ? (
        <div role="status" className="flex items-center gap-3 text-sm text-muted">
          <Spinner className="text-link" label="Mengirim" />
          Memproses foto dan menghitung poin...
        </div>
      ) : null}

      <Button
        size="lg"
        onClick={submit}
        disabled={submitting || blocked}
        aria-describedby={blocked ? "foto-tidak-sesuai" : undefined}
        className="reveal w-full sm:w-auto"
      >
        Kirim dan klaim poin
      </Button>
    </div>
  );
}

/** Menampilkan hasil pengenal foto terhadap tong yang dipindai: sesuai, tidak sesuai, pengingat, atau belum yakin. */
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
  const suggestion = result.suggested && result.itemId ? findWasteItem(result.itemId) : undefined;
  const percent = Math.round(result.confidence * 100);
  const chosen = itemId ? findWasteItem(itemId) : undefined;
  const verdict = binVerdict(result, category);
  const scanned = BINS[category].label;

  if (verdict === "block" || verdict === "warn") {
    const other = BINS[result.binId ?? category].label;
    const looksLike = suggestion ? suggestion.label : `sampah ${other}`;
    if (verdict === "block") {
      return (
        <div id="foto-tidak-sesuai">
          <InlineNotice tone="error" className="mt-3">
            <p className="font-bold">Sampah tidak sesuai dengan tong {scanned}.</p>
            <p className="mt-1">
              {`Foto terlihat seperti ${looksLike} (yakin ${percent}%), yang masuk tong ${other}. `}
              Buang ke tong yang sesuai lalu pindai QR-nya. Kalau tebakan ini keliru, foto ulang dengan sampah terlihat
              jelas.
            </p>
          </InlineNotice>
        </div>
      );
    }
    return (
      <InlineNotice tone="warning" className="mt-3">
        {`Foto terlihat seperti ${looksLike} (yakin ${percent}%), yang masuk tong ${other}. `}
        {`Kamu memindai tong ${scanned}, jadi cek lagi sampahmu sebelum dibuang.`}
        {chosen ? ` Pilihanmu tetap ${chosen.label}.` : " Pilih jenis sampah di atas."}
      </InlineNotice>
    );
  }

  if (verdict === "match") {
    let detail = `Yakin ${percent}%.`;
    if (suggestion && itemId === suggestion.id) {
      detail = autoPicked
        ? `Tebakan: ${suggestion.label} (yakin ${percent}%). Pilihan di atas sudah diisi, ganti kalau salah.`
        : `Foto cocok dengan pilihanmu: ${suggestion.label} (yakin ${percent}%).`;
    } else if (suggestion) {
      detail = `Foto terlihat seperti ${suggestion.label} (yakin ${percent}%).${chosen ? ` Pilihanmu tetap ${chosen.label}.` : " Pilih jenis sampah di atas."}`;
    }
    return (
      <InlineNotice tone="success" className="mt-3">
        <p className="font-bold">Sampah sesuai dengan tong {scanned}.</p>
        <p className="mt-1">{detail}</p>
      </InlineNotice>
    );
  }

  return (
    <InlineNotice className="mt-3">
      Jenis sampah di foto belum bisa dikenali dengan yakin. Pilih sendiri di atas.
    </InlineNotice>
  );
}
