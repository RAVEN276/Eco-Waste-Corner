import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Default surface: solid, thin border. No shadow, so elevation stays reserved for dialogs. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-line bg-white p-5 sm:p-6", className)}
      {...props}
    />
  );
}

/**
 * Glassmorphism surface. Only meaningful over a colored or imagery backdrop,
 * so it is used sparingly: the hero status panel and the map legend.
 */
export function GlassCard({
  className,
  tone = "light",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: "light" | "dark" }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 text-white backdrop-blur-md",
        tone === "light" ? "border-white/30 bg-white/15" : "border-white/20 bg-forest/75",
        className,
      )}
      {...props}
    />
  );
}
