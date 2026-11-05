import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AlertIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function Spinner({ className, label = "Memuat" }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center">
      <span
        aria-hidden="true"
        className={cn(
          "size-5 animate-spin rounded-full border-[3px] border-current border-t-transparent",
          className,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingState({ label = "Memuat data", className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-plate border-2 border-dashed border-edge px-6 py-12 text-muted",
        className,
      )}
    >
      <Spinner className="size-7 text-cobalt" label={label} />
      <p className="text-sm" aria-hidden="true">
        {label}
      </p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-plate border-2 border-dashed border-edge px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-cobalt">{icon}</div> : null}
      <h3 className="text-3xl">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Data gagal dimuat",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-plate border-2 border-brick bg-brick-soft px-6 py-10 text-center",
        className,
      )}
    >
      <AlertIcon className="size-7 text-brick" />
      <h3 className="text-3xl text-ink">{title}</h3>
      <p className="max-w-md text-sm text-brick-ink">{message}</p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}

export function InlineNotice({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "warning" | "error";
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-cobalt bg-cobalt-soft text-ink",
    warning: "border-ink bg-kertas-soft text-ink",
    error: "border-brick bg-brick-soft text-brick-ink",
  } as const;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-ctl border-2 px-4 py-3 text-sm", tones[tone], className)}
    >
      {children}
    </div>
  );
}
