import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "light" | "outline" | "ghost" | "danger";
type Size = "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-cobalt text-white hover:bg-cobalt-deep active:bg-[#101c5e] disabled:hover:bg-cobalt",
  dark: "bg-ink text-white hover:bg-[#252d47] active:bg-black disabled:hover:bg-ink",
  light:
    "bg-white text-ink hover:bg-cobalt-soft active:bg-[#cfd6f2] disabled:hover:bg-white",
  outline:
    "border-2 border-ink bg-transparent text-ink hover:bg-cobalt-soft active:bg-[#cfd6f2] disabled:hover:bg-transparent",
  ghost: "text-cobalt hover:bg-cobalt-soft active:bg-[#cfd6f2] disabled:hover:bg-transparent",
  danger: "bg-brick text-white hover:bg-[#971d14] active:bg-[#7f180f] disabled:hover:bg-brick",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-ctl font-bold transition-[color,background-color,scale] duration-150",
    "active:scale-[0.98] disabled:opacity-55 disabled:active:scale-100",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };

type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & { href: string };

export function Button(props: ButtonProps | LinkProps) {
  if (props.href !== undefined) {
    const { variant, size, className, children, href, ...rest } = props;
    return (
      <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant, size, className, children, type = "button", ...rest } = props;
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
