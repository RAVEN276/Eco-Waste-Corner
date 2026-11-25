"use client";

import { useEffect, useRef, useState } from "react";
import { CameraPanel } from "@/components/scan/CameraPanel";
import { useCameraStream } from "@/hooks/useCameraStream";

const SCAN_INTERVAL_MS = 140;
const MAX_DECODE_WIDTH = 640;
const FOCUS_DURATION_MS = 360;
const IDLE_RETICLE_RATIO = 0.64;

// Ponsel: setinggi layar (3:4) dan menempel ke tepi plat. Desktop: selebar kolom (4:3).
const FRAME =
  "aspect-[3/4] max-h-[72svh] border-y-2 border-line sm:aspect-[4/3] sm:max-h-[34rem] sm:rounded-plate sm:border-2";
// Sudut putih dengan halo gelap tipis, supaya tetap terlihat di atas latar kamera yang terang maupun gelap.
const CORNER = "absolute size-9 border-white drop-shadow-[0_0_3px_rgba(7,8,11,0.9)] sm:size-12";

interface QrCorner {
  x: number;
  y: number;
}

interface QrLocation {
  topLeftCorner: QrCorner;
  topRightCorner: QrCorner;
  bottomRightCorner: QrCorner;
  bottomLeftCorner: QrCorner;
}

interface QrFocus {
  originX: number;
  originY: number;
  videoScale: number;
  reticleDx: number;
  reticleDy: number;
  reticleScale: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Memetakan koordinat QR dari canvas ke ruang pratinjau `<video object-cover>` untuk animasi zoom. */
function computeQrFocus(
  location: QrLocation,
  canvasWidth: number,
  canvasHeight: number,
  videoWidth: number,
  videoHeight: number,
  boxWidth: number,
  boxHeight: number,
): QrFocus {
  const renderScale = Math.max(boxWidth / videoWidth, boxHeight / videoHeight);
  const renderedW = videoWidth * renderScale;
  const renderedH = videoHeight * renderScale;
  const offsetX = (boxWidth - renderedW) / 2;
  const offsetY = (boxHeight - renderedH) / 2;

  const corners = [
    location.topLeftCorner,
    location.topRightCorner,
    location.bottomRightCorner,
    location.bottomLeftCorner,
  ].map((corner) => ({
    x: offsetX + (corner.x / canvasWidth) * renderedW,
    y: offsetY + (corner.y / canvasHeight) * renderedH,
  }));

  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const minX = clamp(Math.min(...xs), 0, boxWidth);
  const maxX = clamp(Math.max(...xs), 0, boxWidth);
  const minY = clamp(Math.min(...ys), 0, boxHeight);
  const maxY = clamp(Math.max(...ys), 0, boxHeight);

  const shortSide = Math.min(boxWidth, boxHeight);
  const centerX = clamp((minX + maxX) / 2, 24, boxWidth - 24);
  const centerY = clamp((minY + maxY) / 2, 24, boxHeight - 24);
  const qrSide = clamp(Math.max(maxX - minX, maxY - minY), 56, shortSide * 0.8);

  // Zoom kamera agar ukuran QR mendekati ~48% sisi terpendek bingkai, tetap dalam rentang wajar.
  const videoScale = clamp((shortSide * 0.48) / qrSide, 1.25, 2.2);
  const zoomedSide = clamp(qrSide * videoScale + 20, 96, shortSide * 0.72);
  const idleSize = shortSide * IDLE_RETICLE_RATIO;

  return {
    originX: clamp((centerX / boxWidth) * 100, 0, 100),
    originY: clamp((centerY / boxHeight) * 100, 0, 100),
    videoScale,
    reticleDx: centerX - boxWidth / 2,
    reticleDy: centerY - boxHeight / 2,
    reticleScale: clamp(zoomedSide / idleSize, 0.35, 1.15),
  };
}

interface QrScannerProps {
  /** Dipanggil dengan teks setiap QR yang terbaca. Pemanggil memutuskan teks itu sah atau tidak. */
  onDetect: (text: string) => void;
  /** Bila diisi, animasi fokus/zoom hanya berjalan ketika QR yang terbaca lolos pemeriksaan ini. */
  validateText?: (text: string) => boolean;
  onRetry: () => void;
}

/** jsQR baru diunduh saat pemindai dibuka, dan gambar dikecilkan dulu supaya ringan di ponsel lama. */
export function QrScanner({ onDetect, validateText, onRetry }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const status = useCameraStream(videoRef);
  const [focus, setFocus] = useState<QrFocus | null>(null);
  const onDetectRef = useRef(onDetect);
  const validateRef = useRef(validateText);

  useEffect(() => {
    onDetectRef.current = onDetect;
    validateRef.current = validateText;
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
    let locked = false;
    let frame = 0;
    let detectTimer = 0;
    let lastRun = 0;
    let decode:
      | ((data: Uint8ClampedArray, width: number, height: number) => { data: string; location: QrLocation } | null)
      | null = null;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    import("jsqr").then((module) => {
      decode = (data, width, height) => module.default(data, width, height, { inversionAttempts: "dontInvert" });
    });

    const tick = (now: number) => {
      if (stopped || locked) return;
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
      if (!code?.data) return;

      const valid = validateRef.current ? validateRef.current(code.data) : true;
      if (!valid) {
        onDetectRef.current(code.data);
        return;
      }

      locked = true;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const container = frameRef.current;
      if (reduced || !container || container.clientWidth === 0 || container.clientHeight === 0) {
        onDetectRef.current(code.data);
        return;
      }

      // Bekukan bingkai kamera di momen QR terbaca supaya animasi zoom tetap tepat sasaran walau tangan bergerak.
      video.pause();
      setFocus(
        computeQrFocus(
          code.location,
          canvas.width,
          canvas.height,
          video.videoWidth,
          video.videoHeight,
          container.clientWidth,
          container.clientHeight,
        ),
      );
      detectTimer = window.setTimeout(() => {
        if (!stopped) onDetectRef.current(code.data);
      }, FOCUS_DURATION_MS);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(detectTimer);
    };
  }, [status]);

  const videoStyle = focus
    ? {
        transform: `scale(${focus.videoScale})`,
        transformOrigin: `${focus.originX}% ${focus.originY}%`,
      }
    : undefined;

  const reticleStyle = focus
    ? {
        transform: `translate(${focus.reticleDx}px, ${focus.reticleDy}px) scale(${focus.reticleScale})`,
      }
    : undefined;

  return (
    <div ref={frameRef}>
      <CameraPanel videoRef={videoRef} status={status} onRetry={onRetry} videoStyle={videoStyle} className={FRAME}>
        {/* Luar bingkai digelapkan. cqmin membuat kotak ikut sisi terpendek. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center [container-type:size]"
        >
          <div
            style={reticleStyle}
            className="relative size-[64cqmin] shadow-[0_0_0_200vmax_rgba(7,8,11,0.45)] transition-transform duration-[340ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          >
            <span className={`left-0 top-0 border-l-4 border-t-4 ${CORNER}`} />
            <span className={`right-0 top-0 border-r-4 border-t-4 ${CORNER}`} />
            <span className={`bottom-0 left-0 border-b-4 border-l-4 ${CORNER}`} />
            <span className={`bottom-0 right-0 border-b-4 border-r-4 ${CORNER}`} />
          </div>
        </div>
        <p className="absolute inset-x-3 bottom-3 rounded-ctl bg-night/75 px-3 py-2 text-center text-sm text-white">
          {focus ? "QR terbaca." : "Arahkan kamera ke kode QR di tong. Pastikan seluruh kode masuk bingkai."}
        </p>
      </CameraPanel>
    </div>
  );
}
