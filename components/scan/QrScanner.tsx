"use client";

import { useEffect, useRef } from "react";
import { CameraPanel } from "@/components/scan/CameraPanel";
import { useCameraStream } from "@/hooks/useCameraStream";

const SCAN_INTERVAL_MS = 140;
const MAX_DECODE_WIDTH = 640;
// Ponsel: setinggi layar (3:4) dan menempel ke tepi plat. Desktop: selebar kolom (4:3).
const FRAME =
  "aspect-[3/4] max-h-[72svh] border-y-2 border-line sm:aspect-[4/3] sm:max-h-[34rem] sm:rounded-plate sm:border-2";
// Sudut putih dengan halo gelap tipis, supaya tetap terlihat di atas latar kamera yang terang maupun gelap.
const CORNER = "absolute size-9 border-white drop-shadow-[0_0_3px_rgba(7,8,11,0.9)] sm:size-12";

interface QrScannerProps {
  /** Dipanggil dengan teks setiap QR yang terbaca. Pemanggil memutuskan teks itu sah atau tidak. */
  onDetect: (text: string) => void;
  onRetry: () => void;
}

/** jsQR baru diunduh saat pemindai dibuka, dan gambar dikecilkan dulu supaya ringan di ponsel lama. */
export function QrScanner({ onDetect, onRetry }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const status = useCameraStream(videoRef);
  const onDetectRef = useRef(onDetect);

  useEffect(() => {
    onDetectRef.current = onDetect;
  });

  // Banner dan penanda langkah di atas bisa mendorong kamera ke bawah layar, jadi geser sampai terlihat penuh.
  useEffect(() => {
    if (status !== "live") return;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.top >= 72 && rect.bottom <= window.innerHeight - 72) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    frame.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }, [status]);

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
    <div ref={frameRef}>
      <CameraPanel videoRef={videoRef} status={status} onRetry={onRetry} className={FRAME}>
        {/* Luar bingkai digelapkan. cqmin membuat kotak ikut sisi terpendek. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center [container-type:size]"
        >
          <div className="relative size-[64cqmin] shadow-[0_0_0_999px_rgba(7,8,11,0.45)]">
            <span className={`left-0 top-0 border-l-4 border-t-4 ${CORNER}`} />
            <span className={`right-0 top-0 border-r-4 border-t-4 ${CORNER}`} />
            <span className={`bottom-0 left-0 border-b-4 border-l-4 ${CORNER}`} />
            <span className={`bottom-0 right-0 border-b-4 border-r-4 ${CORNER}`} />
          </div>
        </div>
        <p className="absolute inset-x-3 bottom-3 rounded-ctl bg-night/75 px-3 py-2 text-center text-sm text-white">
          Arahkan kamera ke kode QR di tong. Pastikan seluruh kode masuk bingkai.
        </p>
      </CameraPanel>
    </div>
  );
}
