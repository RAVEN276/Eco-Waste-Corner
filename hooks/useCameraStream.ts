"use client";

import { useEffect, useState, type RefObject } from "react";

export type CameraStatus = "starting" | "live" | "denied" | "unavailable" | "insecure";

function cameraSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

/**
 * Membuka kamera belakang ke elemen video pemanggil, dan mematikannya saat komponen dilepas,
 * termasuk saat Activity menyembunyikan halaman. Kamera menyala begitu komponen dirender, tanpa menunggu tombol.
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
