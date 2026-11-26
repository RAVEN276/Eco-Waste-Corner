import { WASTE_ITEMS } from "@/lib/data/items";
import type { BinCategory } from "@/lib/types";

export interface QuickCheckPrompt {
  itemId: string;
  label: string;
  category: BinCategory;
  question: string;
  choices: [string, string];
  correctIndex: 0 | 1;
  reason: string;
}

interface PromptDetail {
  question: string;
  choices: [string, string];
  correctIndex: 0 | 1;
  reason: string;
}

export const PROMPT_BY_ID: Record<string, PromptDetail> = {
  "sisa-makanan": {
    question: "Nasi dan lauk ini tidak terbungkus plastik. Apakah langsung masuk Organik?",
    choices: ["Ya, masuk Organik", "Tidak, masuk Residu"],
    correctIndex: 0,
    reason: "Sisa makanan tanpa kemasan plastik bisa terurai dan diolah menjadi kompos.",
  },
  "kulit-buah": {
    question: "Kulit pisang atau jeruk baru selesai dikupas. Bagaimana cara membuangnya?",
    choices: ["Masukkan ke Residu", "Masukkan ke Organik"],
    correctIndex: 1,
    reason: "Kulit buah dan sayur termasuk bahan alami yang mudah membusuk sehingga masuk Organik.",
  },
  "ampas-kopi": {
    question: "Ampas kopi atau daun teh masih basah. Apakah karena basah lalu masuk Residu?",
    choices: ["Tidak, tetap Organik", "Ya, masuk Residu"],
    correctIndex: 0,
    reason: "Ampas kopi dan teh berbahan alami. Pastikan penyaring plastik atau sachet-nya dipisah.",
  },
  "daun-kering": {
    question: "Daun dan ranting kering sudah tidak segar lagi. Masuk tong mana?",
    choices: ["Plastik / Kertas (karena kering)", "Organik (bahan alami)"],
    correctIndex: 1,
    reason: "Meski kering, daun dan ranting berasal dari tumbuhan sehingga dikomposkan di Organik.",
  },
  "cangkang-telur": {
    question: "Cangkang telur terasa keras saat dipegang. Apakah ditolak dari tong Organik?",
    choices: ["Ya, buang ke Residu", "Tidak, tetap Organik"],
    correctIndex: 1,
    reason: "Cangkang telur tetap berasal dari bahan alami dan aman dicampur ke kompos Organik.",
  },
  "sisa-roti": {
    question: "Roti atau kue sudah berjamur. Apakah jamur membuatnya harus masuk Residu?",
    choices: ["Tidak, masuk Organik", "Ya, harus ke Residu"],
    correctIndex: 0,
    reason: "Roti dan kue yang tidak terbungkus kemasan plastik tetap diolah di tong Organik.",
  },
  "sayur-layu": {
    question: "Sayur layu sisa masakan kantin. Apakah masuk Plastik / Kertas atau Organik?",
    choices: ["Organik", "Residu"],
    correctIndex: 0,
    reason: "Sayuran berasal dari bahan alami yang dapat terurai sehingga masuk tong Organik.",
  },
  "buah-busuk": {
    question: "Buah sudah membusuk dan berair. Apakah aman dimasukkan ke Organik?",
    choices: ["Ya, masuk Organik", "Tidak, harus Residu"],
    correctIndex: 0,
    reason: "Buah busuk merupakan bahan organik murni yang langsung diolah bersama sampah Organik.",
  },
  "bonggol-buah": {
    question: "Bonggol jagung dan biji mangga cukup tebal. Masuk tong mana?",
    choices: ["Residu", "Organik"],
    correctIndex: 1,
    reason: "Bagian tanaman dan biji buah termasuk bahan alami, jadi tempatnya di tong Organik.",
  },
  "rumput-bunga": {
    question: "Potongan rumput dan bunga layu dari taman kampus. Masuk tong apa?",
    choices: ["Organik", "Residu"],
    correctIndex: 0,
    reason: "Rumput dan tanaman hias layu berasal dari alam dan masuk ke tong Organik.",
  },

  "botol-plastik": {
    question: "Botol plastik sudah dikosongkan dan dibilas singkat. Layak daur ulang?",
    choices: ["Ya, masuk Plastik / Kertas", "Tidak, masuk Residu"],
    correctIndex: 0,
    reason: "Botol plastik kosong yang bersih tidak mengotori isi tong dan bisa didaur ulang.",
  },
  "gelas-plastik": {
    question: "Gelas plastik minuman boba masih penuh sisa es dan gula. Boleh langsung ke Plastik / Kertas?",
    choices: ["Boleh langsung buang", "Kosongkan dan bilas dulu"],
    correctIndex: 1,
    reason: "Gelas plastik baru boleh masuk Plastik / Kertas setelah kosong dan bersih dari cairan manis.",
  },
  "kardus-kertas": {
    question: "Kardus paket dalam kondisi kering dan tidak terkena minyak. Masuk tong mana?",
    choices: ["Plastik / Kertas", "Residu"],
    correctIndex: 0,
    reason: "Kardus dan kertas yang kering serta bersih bisa didaur ulang di tong Plastik / Kertas.",
  },
  "kertas-hvs": {
    question: "Kertas HVS bekas catatan kelas masih kering dan bersih. Masuk tong mana?",
    choices: ["Residu", "Plastik / Kertas"],
    correctIndex: 1,
    reason: "Kertas HVS yang tidak basah dan tidak berminyak dapat didaur ulang bersama Plastik / Kertas.",
  },
  "koran-majalah": {
    question: "Koran atau majalah lama terkena sedikit lipatan tapi kering. Masih bisa daur ulang?",
    choices: ["Ya, masuk Plastik / Kertas", "Tidak, harus ke Residu"],
    correctIndex: 0,
    reason: "Selama kering dan tidak tercampur kotoran atau minyak, koran dan majalah masuk Plastik / Kertas.",
  },
  "buku-bekas": {
    question: "Buku tulis bekas sudah tidak terpakai dan tetap kering. Masuk tong mana?",
    choices: ["Organik (berasal dari kayu)", "Plastik / Kertas"],
    correctIndex: 1,
    reason: "Kertas olahan seperti buku tulis didaur ulang di Plastik / Kertas, bukan dikomposkan di Organik.",
  },
  "tutup-botol": {
    question: "Tutup botol plastik berukuran kecil dan bersih. Apakah dibuang ke Residu saja?",
    choices: ["Ya, masuk Residu", "Tidak, masuk Plastik / Kertas"],
    correctIndex: 1,
    reason: "Tutup botol bersih berbahan plastik padat yang tetap bisa didaur ulang di Plastik / Kertas.",
  },
  "wadah-plastik": {
    question: "Wadah makan plastik sudah dicuci bersih dan dikeringkan. Masuk tong mana?",
    choices: ["Plastik / Kertas", "Residu"],
    correctIndex: 0,
    reason: "Wadah plastik yang bebas sisa makanan dan minyak dapat masuk ke Plastik / Kertas.",
  },
  "tas-kertas": {
    question: "Paper bag belanja masih bersih tanpa noda makanan. Masuk tong mana?",
    choices: ["Residu", "Plastik / Kertas"],
    correctIndex: 1,
    reason: "Tas atau amplop kertas bersih dan kering didaur ulang di tong Plastik / Kertas.",
  },
  brosur: {
    question: "Selebaran atau brosur acara kampus sudah tidak dibaca dan kering. Masuk tong mana?",
    choices: ["Plastik / Kertas", "Organik"],
    correctIndex: 0,
    reason: "Brosur kertas bersih masuk Plastik / Kertas selama tidak basah atau terkena makanan.",
  },

  "puntung-rokok": {
    question: "Puntung rokok terlihat kecil seperti daun kering. Apakah masuk Organik?",
    choices: ["Ya, masuk Organik", "Tidak, masuk Residu"],
    correctIndex: 1,
    reason: "Filter puntung rokok mengandung serat plastik sintetis sehingga tidak bisa dikomposkan.",
  },
  masker: {
    question: "Masker sekali pakai selesai digunakan. Bisa didaur ulang di Plastik / Kertas?",
    choices: ["Tidak, masuk Residu", "Ya, masuk Plastik / Kertas"],
    correctIndex: 0,
    reason: "Masker medis bekas mengandung campuran serat non-woven dan risiko kebersihan, jadi masuk Residu.",
  },
  "tisu-bekas": {
    question: "Tisu dibuat dari serat kertas. Apakah tisu bekas lap tangan masuk Plastik / Kertas?",
    choices: ["Ya, masuk Plastik / Kertas", "Tidak, masuk Residu"],
    correctIndex: 1,
    reason: "Serat tisu terlalu pendek dan sudah kotor sehingga tidak bisa didaur ulang.",
  },
  sachet: {
    question: "Bungkus kopi instan menggabungkan plastik dan lapisan foil. Masuk tong mana?",
    choices: ["Plastik / Kertas", "Residu"],
    correctIndex: 1,
    reason: "Kemasan multilayer mencampur beberapa bahan yang sulit dipisah, jadi masuk ke Residu.",
  },
  "bungkus-snack": {
    question: "Bungkus mi instan atau snack ada lapisan perak di dalamnya. Masih bisa daur ulang?",
    choices: ["Tidak, masuk Residu", "Ya, masuk Plastik / Kertas"],
    correctIndex: 0,
    reason: "Lapisan campuran plastik dan logam serta sisa bumbu membuat bungkus snack masuk Residu.",
  },
  styrofoam: {
    question: "Wadah styrofoam bekas bubur terasa ringan seperti plastik. Masuk Plastik / Kertas?",
    choices: ["Ya, masuk Plastik / Kertas", "Tidak, masuk Residu"],
    correctIndex: 1,
    reason: "Styrofoam bekas makanan sulit didaur ulang dan sering menyerap minyak, sehingga masuk Residu.",
  },
  "kertas-berminyak": {
    question: "Kotak makan kertas terkena noda minyak gorengan. Masih layak masuk Plastik / Kertas?",
    choices: ["Ya, tetap daur ulang", "Tidak, pindah ke Residu"],
    correctIndex: 1,
    reason: "Minyak meresap ke serat kertas dan merusak bubur kertas daur ulang, jadi masuk Residu.",
  },
  "permen-karet": {
    question: "Permen karet habis dikunyah bukan kemasan plastik. Apakah bisa dikomposkan di Organik?",
    choices: ["Tidak, masuk Residu", "Ya, masuk Organik"],
    correctIndex: 0,
    reason: "Permen karet berbahan dasar polimer sintetis yang tidak terurai seperti sisa makanan.",
  },
  "sarung-tangan": {
    question: "Sarung tangan plastik sekali pakai selesai dipakai makan. Masuk tong mana?",
    choices: ["Plastik / Kertas", "Residu"],
    correctIndex: 1,
    reason: "Sarung tangan sekali pakai yang sudah terkontaminasi makanan atau kotoran masuk Residu.",
  },
  "tisu-basah": {
    question: "Tisu basah terlihat seperti kertas lembap. Apakah aman masuk Organik atau Plastik / Kertas?",
    choices: ["Tidak, masuk Residu", "Masuk Plastik / Kertas"],
    correctIndex: 0,
    reason: "Tisu basah mengandung serat sintetis dan cairan pembersih sehingga harus masuk Residu.",
  },
};

export const QUICK_CHECK_POOL: QuickCheckPrompt[] = WASTE_ITEMS.map((item) => {
  const detail = PROMPT_BY_ID[item.id];
  return {
    itemId: item.id,
    label: item.label,
    category: item.category,
    question: detail.question,
    choices: detail.choices,
    correctIndex: detail.correctIndex,
    reason: detail.reason,
  };
});

export const QUICK_CHECK_ROUND_SIZE = 3;

function shufflePrompts(list: QuickCheckPrompt[]): QuickCheckPrompt[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Mengambil beberapa soal acak dari seluruh kamus, hindari soal ronde barusan. Hanya dipanggil di effect atau handler klik. */
export function pickQuickCheckRound(
  excludeIds: readonly string[] = [],
  count = QUICK_CHECK_ROUND_SIZE,
  source: QuickCheckPrompt[] = QUICK_CHECK_POOL,
): QuickCheckPrompt[] {
  if (source.length === 0) return [];
  const excluded = new Set(excludeIds);
  const fresh = source.filter((item) => !excluded.has(item.itemId));
  const pool = fresh.length >= count ? fresh : source;
  return shufflePrompts(pool).slice(0, count);
}
