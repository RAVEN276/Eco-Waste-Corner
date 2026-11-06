"use client";

import type { ReactNode, RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { AlertIcon } from "@/components/ui/Icons";
import { Spinner } from "@/components/ui/States";
import type { CameraStatus } from "@/hooks/useCameraStream";
import { cn } from "@/lib/utils";

const PROBLEMS = {
  denied: {
    title: "Akses kamera ditolak",
    text: "Izinkan kamera untuk situs ini di pengaturan browser, lalu coba lagi.",
  },
  unavailable: {
    title: "Kamera tidak bisa dibuka",
    text: "Kamera tidak ditemukan atau sedang dipakai aplikasi lain. Tutup aplikasi itu, lalu coba lagi.",
  },
  insecure: {
    title: "Kamera tidak tersedia di sini",
    text: "Browser hanya mengizinkan kamera di alamat https. Buka aplikasi lewat alamat https, atau pakai browser lain.",
  },
} as const;

interface CameraPanelProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  onRetry?: () => void;
  /** Rasio, batas tinggi, sudut, dan garis tepi ditentukan pemanggil. */
  className?: string;
  /** Tampil di atas gambar kamera hanya saat kamera menyala (misalnya bingkai bidik). */
  children?: ReactNode;
}

/** Elemen video selalu ada supaya kamera bisa tersambung. Keadaan memuat atau gagal menutupinya dengan penjelasan. */
export function CameraPanel({ videoRef, status, onRetry, className, children }: CameraPanelProps) {
  const problem = status === "denied" || status === "unavailable" || status === "insecure" ? PROBLEMS[status] : null;

  return (
    <div className={cn("relative w-full overflow-clip bg-night text-white", className)}>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        aria-label="Pratinjau kamera"
        className={cn("absolute inset-0 size-full object-cover", status !== "live" && "invisible")}
      />
      {status === "live" ? children : null}

      {status === "starting" ? (
        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Spinner className="size-7 text-white" label="Membuka kamera" />
          <p className="text-sm">Membuka kamera. Jika browser meminta izin, pilih Izinkan.</p>
        </div>
      ) : null}

      {problem ? (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center">
          <AlertIcon className="size-7" />
          <p className="font-display text-2xl font-extrabold leading-tight">{problem.title}</p>
          <p className="max-w-sm text-sm text-mist">{problem.text}</p>
          {onRetry && status !== "insecure" ? (
            <Button variant="light" onClick={onRetry}>
              Coba lagi
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
