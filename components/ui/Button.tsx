import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "mint" | "outline" | "ghost" | "danger" | "sun";
type Size = "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-forest text-white hover:bg-[#143a2f] active:bg-[#0f2d24]",
  mint: "bg-mint text-forest hover:bg-[#93dcbf] active:bg-[#7fd1b0]",
  sun: "bg-sun text-charcoal hover:bg-[#d99429] active:bg-[#c88720]",
  outline:
    "border-2 border-forest text-forest bg-transparent hover:bg-mint-soft active:bg-mint",
  ghost: "text-forest hover:bg-mint-soft active:bg-mint",
  danger: "bg-brick text-white hover:bg-[#971d14] active:bg-[#7f180f]",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 py-2 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150",
    "disabled:opacity-60 disabled:hover:bg-inherit",
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
