export type Theme = "light" | "dark";

export const THEME_KEY = "ewc:theme";

/**
 * Dijalankan di <head> sebelum halaman tampil, supaya tema yang benar sudah terpasang saat
 * cat pertama (tanpa kilatan terang lalu gelap). Pilihan yang disimpan menang; tanpa pilihan,
 * mengikuti pengaturan sistem. Selalu memasang atribut data-theme, jadi CSS cukup membaca atribut.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("${THEME_KEY}");var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}})()`;
