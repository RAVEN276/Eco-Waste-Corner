"use client";

import { ErrorState } from "@/components/ui/States";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20">
      <ErrorState
        title="Halaman bermasalah"
        message={error.message || "Terjadi kesalahan tak terduga."}
        onRetry={reset}
      />
    </div>
  );
}
