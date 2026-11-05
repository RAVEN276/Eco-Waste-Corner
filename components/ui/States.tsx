import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Spinner({ className, label = "Memuat" }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 aria-hidden="true" className={cn("size-5 animate-spin", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingState({ label = "Memuat data", className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line px-6 py-12 text-muted", className)}
    >
      <Spinner className="size-7 text-leaf-deep" label={label} />
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
      className={cn("flex flex-col items-center gap-3 rounded-xl border border-dashed border-line px-6 py-12 text-center", className)}
    >
      {icon ? <div className="text-leaf-deep">{icon}</div> : null}
      <h3 className="text-lg font-semibold">{title}</h3>
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
      className={cn("flex flex-col items-center gap-3 rounded-xl border border-brick/40 bg-[#fdf3f2] px-6 py-10 text-center", className)}
    >
      <AlertTriangle aria-hidden="true" className="size-7 text-brick" />
      <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
      <p className="max-w-md text-sm text-[#5c1a14]">{message}</p>
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
    info: "border-leaf-deep/30 bg-mint-soft text-forest",
    warning: "border-sun/60 bg-sun-soft/60 text-charcoal",
    error: "border-brick/40 bg-[#fdf3f2] text-[#5c1a14]",
  } as const;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}
    >
      {children}
    </div>
  );
}
