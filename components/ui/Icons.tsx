import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Ikon sengaja sedikit: hanya untuk aksi yang butuh simbol. Garis tebal, ujung
 * kotak, dan sudut runcing mengikuti nada papan penanda. Tong tidak punya ikon,
 * karena warna, label, dan angka poinnya sudah cukup.
 */
function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </Base>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 12.5l5 5L20 6.5" />
    </Base>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.5L21.5 20h-19L12 3.5z" />
      <path d="M12 10v4.5M12 17.5v.5" />
    </Base>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </Base>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 7.5h4l1.5-3h7l1.5 3h4V20H3V7.5z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </Base>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 4.5v5h-5" />
      <path d="M19.5 9.5A8 8 0 1 0 20 14" />
    </Base>
  );
}
