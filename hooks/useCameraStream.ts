"use client";

import { useEffect, useState, type RefObject } from "react";

export type CameraStatus = "starting" | "live" | "denied" | "unavailable" | "insecure";

function cameraSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

/**
 * Membuka kamera belakang dan menyambungkannya ke elemen video milik pemanggil. Kamera berhenti
 * saat komponen dilepas (termasuk saat halaman disembunyikan Activity), jadi lampu kamera tidak
 * menyala terus. Kamera menyala begitu komponen yang memakainya dirender: pemindai QR sengaja
 * dirender langsung saat langkah scan terbuka, sedangkan kamera foto bukti baru dirender setelah tombol ditekan.
 */
export function useCameraStream(videoRef: RefObject<HTMLVideoElement | null>): CameraStatus {
  const [status, setStatus] = useState<CameraStatus>(() => (cameraSupported() ? "starting" : "insecure"));

  useEffect(() => {
    if (!cameraSupported()) return;
    const video = videoRef.current;
    let stopped = false;
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      .then(async (opened) => {
        if (stopped) {
          opened.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = opened;
        if (!video) return;
        video.srcObject = opened;
        await video.play();
        if (!stopped) setStatus("live");
      })
      .catch((error: unknown) => {
        if (stopped) return;
        const name = error instanceof DOMException ? error.name : "";
        setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
      });

    return () => {
      stopped = true;
      stream?.getTracks().forEach((track) => track.stop());
      if (video) video.srcObject = null;
    };
  }, [videoRef]);

  return status;
}
