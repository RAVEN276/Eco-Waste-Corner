"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { CameraPanel } from "@/components/scan/CameraPanel";
import { Button } from "@/components/ui/Button";
import { CameraIcon } from "@/components/ui/Icons";
import { useCameraStream } from "@/hooks/useCameraStream";

const FRAME =
  "aspect-[3/4] max-h-[65svh] border-y-2 border-line sm:aspect-[4/3] sm:max-h-[30rem] sm:rounded-plate sm:border-2";

interface ProofCameraProps {
  disabled: boolean;
  onCapture: (file: File, timestamp: number) => void;
  onCancel: () => void;
  onError: (message: string) => void;
  onRetry: () => void;
}

/** Kamera terintegrasi di dalam halaman untuk memotret sampah bukti sebelum dikirim ke pengenal ML. */
export function ProofCamera({ disabled, onCapture, onCancel, onError, onRetry }: ProofCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const status = useCameraStream(videoRef);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (status !== "live") return;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.top >= 72 && rect.bottom <= window.innerHeight - 72) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    frame.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }, [status]);

  const capture = (event: MouseEvent<HTMLButtonElement>) => {
    const video = videoRef.current;
    if (status !== "live" || !video || video.readyState < 2 || video.videoWidth === 0 || capturing) return;

    setCapturing(true);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCapturing(false);
      onError("Browser tidak mendukung pengambilan gambar dari kamera.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedAt = event.timeStamp;
    canvas.toBlob(
      (blob) => {
        setCapturing(false);
        if (!blob || blob.size === 0) {
          onError("Foto gagal diambil dari kamera. Coba lagi.");
          return;
        }
        const file = new File([blob], "foto-bukti.jpg", { type: "image/jpeg" });
        onCapture(file, capturedAt);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div ref={frameRef} className="space-y-4">
      <div className="-mx-5 sm:mx-0">
        <CameraPanel videoRef={videoRef} status={status} onRetry={onRetry} className={FRAME}>
          <p className="absolute inset-x-3 bottom-3 rounded-ctl bg-night/75 px-3 py-2 text-center text-sm text-white">
            Arahkan kamera ke sampah yang kamu buang, lalu tekan Ambil foto.
          </p>
        </CameraPanel>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          onClick={capture}
          disabled={disabled || status !== "live" || capturing}
          className="w-full sm:w-auto"
        >
          <CameraIcon className="size-5 shrink-0" />
          {capturing ? "Mengambil foto..." : "Ambil foto"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onCancel}
          disabled={disabled || capturing}
          className="w-full sm:w-auto"
        >
          Tutup kamera
        </Button>
      </div>
    </div>
  );
}
