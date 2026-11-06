"use client";

import { useRef, useState } from "react";
import { CameraPanel } from "@/components/scan/CameraPanel";
import { Button } from "@/components/ui/Button";
import { useCameraStream } from "@/hooks/useCameraStream";

const MAX_SIDE_PX = 1280;

interface CameraCaptureProps {
  onCapture: (photo: File) => void;
  onCancel: () => void;
  onRetry: () => void;
}

/**
 * Satu-satunya jalan masuk foto bukti: gambar diambil dari kamera yang sedang menyala. Tidak ada
 * pemilih berkas, jadi foto dari galeri atau tangkapan layar tidak bisa dipakai.
 */
export function CameraCapture({ onCapture, onCancel, onRetry }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const status = useCameraStream(videoRef);
  const [problem, setProblem] = useState<string | null>(null);

  const capture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) {
      setProblem("Gambar kamera belum siap. Tunggu sebentar, lalu coba lagi.");
      return;
    }
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      setProblem("Browser ini tidak bisa memproses foto. Coba browser lain.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setProblem("Foto gagal diambil. Coba lagi.");
          return;
        }
        setProblem(null);
        onCapture(new File([blob], `bukti-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <CameraPanel videoRef={videoRef} status={status} onRetry={onRetry} />
      </div>
      {problem ? (
        <p role="alert" className="text-sm font-bold text-brick-text">
          {problem}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={capture} disabled={status !== "live"}>
          Ambil foto
        </Button>
        <Button variant="outline" size="lg" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  );
}
