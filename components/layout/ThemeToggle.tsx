"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/Icons";
import { THEME_KEY, type Theme } from "@/lib/theme";

// Tema yang berlaku dibaca dari atribut data-theme di <html> (dipasang skrip awal di layout).
// Pilihan pengguna disimpan di localStorage. Tanpa pilihan, tema mengikuti pengaturan sistem,
// termasuk saat sistem berganti terang dan gelap ketika halaman terbuka.

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function readStored(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readStored()) return;
    apply(systemTheme());
    emit();
  };
  // Tab lain mengganti tema: ikut berganti.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return;
    apply(readStored() ?? systemTheme());
    emit();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

// Server tidak tahu tema pengguna. Render pertama memakai "light", lalu React menyesuaikan
// setelah hidrasi. Ikonnya sendiri berganti lewat CSS (varian dark:), jadi tidak berkedip.
function getServerSnapshot(): Theme {
  return "light";
}

function toggle() {
  const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
  apply(next);
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
    // Penyimpanan diblokir: tema tetap berganti untuk sesi ini.
  }
  emit();
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className={
        "inline-flex size-11 shrink-0 items-center justify-center rounded-ctl border-2 border-line text-ink hover:bg-cobalt-soft active:bg-cobalt-press" +
        (className ? ` ${className}` : "")
      }
    >
      <MoonIcon className="size-5 dark:hidden" />
      <SunIcon className="hidden size-5 dark:block" />
    </button>
  );
}
