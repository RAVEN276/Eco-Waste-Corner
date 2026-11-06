"use client";

import { useEffect, useRef } from "react";
import { CameraPanel } from "@/components/scan/CameraPanel";
import { useCameraStream } from "@/hooks/useCameraStream";

const SCAN_INTERVAL_MS = 140;
const MAX_DECODE_WIDTH = 640;
// Sudut putih dengan halo gelap tipis, supaya tetap terlihat di atas latar kamera yang terang maupun gelap.
const CORNER = "absolute size-8 border-white drop-shadow-[0_0_3px_rgba(7,8,11,0.9)]";

interface QrScannerProps {
  /** Dipanggil dengan teks setiap QR yang terbaca. Pemanggil memutuskan teks itu sah atau tidak. */
  onDetect: (text: string) => void;
  onRetry: () => void;
}

/**
 * Kamera yang membaca QR terus-menerus. Pembacanya (jsQR) baru diunduh saat pemindai dibuka,
 * jadi halaman lain tidak menanggung ukurannya. Gambar dikecilkan sebelum dibaca supaya ringan di ponsel lama.
 */
export function QrScanner({ onDetect, onRetry }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const status = useCameraStream(videoRef);
  const onDetectRef = useRef(onDetect);

  useEffect(() => {
    onDetectRef.current = onDetect;
  });

  useEffect(() => {
    if (status !== "live") return;

    let stopped = false;
    let frame = 0;
    let lastRun = 0;
    let decode: ((data: Uint8ClampedArray, width: number, height: number) => { data: string } | null) | null = null;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    import("jsqr").then((module) => {
      decode = (data, width, height) => module.default(data, width, height, { inversionAttempts: "dontInvert" });
    });

    const tick = (now: number) => {
      if (stopped) return;
      frame = requestAnimationFrame(tick);
      const video = videoRef.current;
      if (now - lastRun < SCAN_INTERVAL_MS || !decode || !context || !video) return;
      if (video.readyState < 2 || video.videoWidth === 0) return;
      lastRun = now;

      const scale = Math.min(1, MAX_DECODE_WIDTH / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = decode(image.data, image.width, image.height);
      if (code?.data) onDetectRef.current(code.data);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
  }, [status]);

  return (
    <CameraPanel videoRef={videoRef} status={status} onRetry={onRetry}>
      {/* Bingkai bidik: bagian luar digelapkan supaya jelas ke mana kamera diarahkan. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-square h-[68%] shadow-[0_0_0_999px_rgba(7,8,11,0.45)]">
          <span className={`left-0 top-0 border-l-4 border-t-4 ${CORNER}`} />
          <span className={`right-0 top-0 border-r-4 border-t-4 ${CORNER}`} />
          <span className={`bottom-0 left-0 border-b-4 border-l-4 ${CORNER}`} />
          <span className={`bottom-0 right-0 border-b-4 border-r-4 ${CORNER}`} />
        </div>
      </div>
    </CameraPanel>
  );
}
