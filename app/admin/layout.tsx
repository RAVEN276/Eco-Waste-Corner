import type { Metadata } from "next";

// Halaman admin tidak boleh muncul di mesin pencari. Metadata ada di sini karena page.tsx-nya client component.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
