import type { BinCategory, QuizQuestion } from "@/lib/types";

export const QUESTIONS_PER_SCAN = 2;

export const QUIZ_BANK: QuizQuestion[] = [
  {
    id: "org-1",
    category: "organik",
    question: "Mana yang termasuk sampah organik?",
    options: ["Kulit pisang", "Botol air mineral", "Puntung rokok", "Masker sekali pakai"],
    answerIndex: 0,
    explanation: "Kulit buah berasal dari tumbuhan dan bisa terurai menjadi kompos.",
  },
  {
    id: "org-2",
    category: "organik",
    question: "Sisa makanan sebaiknya dibuang dengan cara apa?",
    options: [
      "Dibuang bersama bungkus plastiknya",
      "Dipisah dari kemasan, lalu masuk slot organik",
      "Dimasukkan ke slot residu",
      "Dibakar di halaman",
    ],
    answerIndex: 1,
    explanation: "Kemasan harus dipisah supaya sisa makanan bisa diolah tanpa tercemar plastik.",
  },
  {
    id: "org-3",
    category: "organik",
    question: "Ampas kopi dari kantin masuk ke slot mana?",
    options: ["Residu", "Plastik / Kertas", "Organik", "Tidak perlu dipilah"],
    answerIndex: 2,
    explanation: "Ampas kopi adalah bahan alami yang bisa terurai.",
  },
  {
    id: "org-4",
    category: "organik",
    question: "Apa manfaat utama memisahkan sampah organik?",
    options: [
      "Tong sampah jadi lebih berat",
      "Bisa diolah menjadi kompos dan mengurangi sampah ke TPA",
      "Supaya sampah plastik cepat membusuk",
      "Tidak ada manfaat khusus",
    ],
    answerIndex: 1,
    explanation: "Sampah organik yang terpisah bersih dapat dikomposkan, sehingga volume sampah ke TPA berkurang.",
  },
  {
    id: "pk-1",
    category: "plastik_kertas",
    question: "Apa yang sebaiknya dilakukan pada botol plastik sebelum dibuang?",
    options: [
      "Dibuang dengan sisa minuman di dalamnya",
      "Dikosongkan dan dibilas singkat",
      "Dibakar supaya kecil",
      "Dimasukkan ke slot organik",
    ],
    answerIndex: 1,
    explanation: "Wadah yang kosong dan bersih lebih mudah didaur ulang.",
  },
  {
    id: "pk-2",
    category: "plastik_kertas",
    question: "Mana yang cocok masuk slot Plastik / Kertas?",
    options: ["Kardus kering", "Sisa nasi", "Puntung rokok", "Tisu bekas pakai"],
    answerIndex: 0,
    explanation: "Kardus kering adalah kertas yang bisa didaur ulang.",
  },
  {
    id: "pk-3",
    category: "plastik_kertas",
    question: "Kertas bekas makan yang basah oleh minyak sebaiknya masuk ke mana?",
    options: ["Plastik / Kertas", "Organik", "Residu", "Bebas, semua sama saja"],
    answerIndex: 2,
    explanation: "Kertas berminyak sulit didaur ulang, jadi masuk residu.",
  },
  {
    id: "pk-4",
    category: "plastik_kertas",
    question: "Gelas plastik bekas minuman sudah dikosongkan. Slot yang tepat?",
    options: ["Organik", "Plastik / Kertas", "Residu", "Taruh di lantai"],
    answerIndex: 1,
    explanation: "Gelas plastik bersih termasuk plastik yang bisa didaur ulang.",
  },
  {
    id: "res-1",
    category: "residu",
    question: "Mana yang termasuk residu?",
    options: ["Puntung rokok", "Kulit jeruk", "Kardus kering", "Botol plastik bersih"],
    answerIndex: 0,
    explanation: "Puntung rokok mengandung filter yang tidak bisa dikomposkan maupun didaur ulang biasa.",
  },
  {
    id: "res-2",
    category: "residu",
    question: "Masker sekali pakai yang sudah dipakai masuk ke slot mana?",
    options: ["Organik", "Plastik / Kertas", "Residu", "Slot mana saja"],
    answerIndex: 2,
    explanation: "Masker bekas tidak bisa didaur ulang dan perlu ditangani sebagai residu.",
  },
  {
    id: "res-3",
    category: "residu",
    question: "Kenapa residu disebut pilihan terakhir?",
    options: [
      "Karena slotnya paling kecil",
      "Karena semua sampah lain sudah dipilah dulu, sisanya baru ke residu",
      "Karena residu paling cepat terurai",
      "Karena residu bernilai tinggi",
    ],
    answerIndex: 1,
    explanation: "Pilah organik dan daur ulang dulu supaya residu yang berakhir di TPA sesedikit mungkin.",
  },
  {
    id: "res-4",
    category: "residu",
    question: "Bungkus sachet kopi yang berlapis aluminium dan plastik masuk ke mana?",
    options: ["Organik", "Residu", "Plastik / Kertas", "Dibakar"],
    answerIndex: 1,
    explanation: "Kemasan multilayer sulit dipisahkan lapisannya, jadi dibuang sebagai residu.",
  },

  {
    id: "org-5",
    category: "organik",
    question: "Cangkang telur masuk ke slot mana?",
    options: ["Residu", "Organik", "Plastik / Kertas", "Tidak perlu dipilah"],
    answerIndex: 1,
    explanation: "Cangkang telur adalah sisa bahan makanan, jadi dibuang ke slot organik.",
  },
  {
    id: "org-6",
    category: "organik",
    question: "Mana yang bukan sampah organik?",
    options: ["Daun kering", "Kulit jeruk", "Bungkus sachet multilayer", "Ampas teh"],
    answerIndex: 2,
    explanation: "Sachet multilayer berlapis plastik dan aluminium, jadi masuk residu. Tiga yang lain berasal dari tumbuhan.",
  },
  {
    id: "org-7",
    category: "organik",
    question: "Buah yang sudah busuk dibuang ke slot mana?",
    options: ["Organik", "Residu", "Plastik / Kertas", "Tidak perlu dipilah"],
    answerIndex: 0,
    explanation: "Buah busuk tetap bahan alami yang bisa terurai, jadi masuk organik.",
  },
  {
    id: "org-8",
    category: "organik",
    question: "Bonggol apel dan biji buah masuk ke slot mana?",
    options: ["Residu", "Plastik / Kertas", "Tidak perlu dipilah", "Organik"],
    answerIndex: 3,
    explanation: "Bonggol dan biji buah berasal dari tumbuhan dan bisa terurai.",
  },
  {
    id: "org-9",
    category: "organik",
    question: "Kenapa plastik pembungkus tidak boleh ikut masuk slot organik?",
    options: [
      "Karena plastik membuat tong cepat penuh",
      "Karena plastik mencemari sisa makanan yang mau dikomposkan",
      "Karena plastik cepat membusuk",
      "Karena slot organik hanya untuk sayur",
    ],
    answerIndex: 1,
    explanation: "Plastik tidak terurai seperti bahan organik. Sisa makanan yang tercampur plastik sulit diolah jadi kompos.",
  },
  {
    id: "org-10",
    category: "organik",
    question: "Mana pasangan yang keduanya masuk slot organik?",
    options: [
      "Sisa roti dan cangkang telur",
      "Sisa roti dan botol plastik",
      "Cangkang telur dan tisu bekas",
      "Daun kering dan puntung rokok",
    ],
    answerIndex: 0,
    explanation: "Sisa roti dan cangkang telur sama-sama sisa makanan. Botol plastik, tisu bekas, dan puntung rokok bukan bahan organik.",
  },
  {
    id: "org-11",
    category: "organik",
    question: "Rumput dan bunga layu dari taman kampus masuk ke slot mana?",
    options: ["Residu", "Plastik / Kertas", "Organik", "Tidak perlu dipilah"],
    answerIndex: 2,
    explanation: "Rumput dan bunga layu adalah bahan tumbuhan yang bisa terurai.",
  },
  {
    id: "org-12",
    category: "organik",
    question: "Kenapa puntung rokok tidak boleh masuk slot organik?",
    options: [
      "Karena ukurannya kecil",
      "Karena baunya menyengat",
      "Karena warnanya gelap",
      "Karena filternya mengandung serat plastik",
    ],
    answerIndex: 3,
    explanation: "Filter rokok mengandung serat plastik sehingga tidak bisa dikomposkan. Puntung rokok masuk residu.",
  },

  {
    id: "pk-5",
    category: "plastik_kertas",
    question: "Kertas HVS bekas yang masih kering masuk ke slot mana?",
    options: ["Organik", "Residu", "Plastik / Kertas", "Tidak perlu dipilah"],
    answerIndex: 2,
    explanation: "Kertas HVS yang bersih dan kering bisa didaur ulang.",
  },
  {
    id: "pk-6",
    category: "plastik_kertas",
    question: "Mana yang tidak boleh masuk slot Plastik / Kertas?",
    options: ["Koran bekas", "Tisu bekas pakai", "Buku tulis bekas", "Tutup botol plastik"],
    answerIndex: 1,
    explanation: "Tisu bekas pakai seratnya pendek dan sudah terkena kotoran, jadi tidak bisa didaur ulang dan masuk residu.",
  },
  {
    id: "pk-7",
    category: "plastik_kertas",
    question: "Tutup botol plastik masuk ke slot mana?",
    options: ["Plastik / Kertas", "Organik", "Residu", "Tergantung warnanya"],
    answerIndex: 0,
    explanation: "Tutup botol juga plastik, jadi masuk slot Plastik / Kertas.",
  },
  {
    id: "pk-8",
    category: "plastik_kertas",
    question: "Koran dan majalah bekas yang kering sebaiknya dibuang ke mana?",
    options: ["Residu", "Organik", "Tidak perlu dipilah", "Plastik / Kertas"],
    answerIndex: 3,
    explanation: "Koran dan majalah yang kering adalah kertas yang bisa didaur ulang.",
  },
  {
    id: "pk-9",
    category: "plastik_kertas",
    question: "Kenapa wadah plastik perlu dibilas singkat sebelum dibuang?",
    options: [
      "Supaya wadahnya lebih berat",
      "Supaya plastiknya berubah warna",
      "Supaya wadah bersih dan lebih mudah didaur ulang",
      "Tidak perlu dibilas sama sekali",
    ],
    answerIndex: 2,
    explanation: "Sisa yang menempel mengotori bahan daur ulang, jadi wadah dikosongkan dan dibilas singkat dulu.",
  },
  {
    id: "pk-10",
    category: "plastik_kertas",
    question: "Brosur atau flyer bekas yang kering masuk ke slot mana?",
    options: ["Residu", "Organik", "Tidak perlu dipilah", "Plastik / Kertas"],
    answerIndex: 3,
    explanation: "Brosur dari kertas yang kering bisa didaur ulang.",
  },
  {
    id: "pk-11",
    category: "plastik_kertas",
    question: "Mana pasangan yang keduanya masuk slot Plastik / Kertas?",
    options: [
      "Botol plastik kosong dan kardus kering",
      "Botol plastik kosong dan sisa nasi",
      "Kardus kering dan permen karet",
      "Gelas plastik bersih dan masker bekas",
    ],
    answerIndex: 0,
    explanation: "Botol plastik kosong dan kardus kering sama-sama bisa didaur ulang. Sisa nasi organik, sedangkan permen karet dan masker bekas masuk residu.",
  },
  {
    id: "pk-12",
    category: "plastik_kertas",
    question: "Apa syarat kertas supaya bisa masuk slot Plastik / Kertas?",
    options: [
      "Basah supaya tidak terbang",
      "Berminyak asal tidak berbau",
      "Bersih dan kering",
      "Sudah dirobek kecil-kecil",
    ],
    answerIndex: 2,
    explanation: "Kertas harus bersih dan kering supaya bisa didaur ulang. Minyak meresap ke serat dan mengganggu prosesnya.",
  },

  {
    id: "res-5",
    category: "residu",
    question: "Tisu bekas pakai masuk ke slot mana?",
    options: ["Plastik / Kertas", "Residu", "Organik", "Slot mana saja"],
    answerIndex: 1,
    explanation: "Tisu memang dari kertas, tapi seratnya pendek dan sudah terkena kotoran, jadi tidak bisa didaur ulang.",
  },
  {
    id: "res-6",
    category: "residu",
    question: "Permen karet masuk ke slot mana?",
    options: ["Organik", "Plastik / Kertas", "Slot mana saja", "Residu"],
    answerIndex: 3,
    explanation: "Permen karet berbahan dasar polimer sintetis, jadi tidak membusuk seperti bahan organik.",
  },
  {
    id: "res-7",
    category: "residu",
    question: "Di antara empat ini, mana yang masuk residu?",
    options: ["Cangkang telur", "Styrofoam bekas makanan", "Koran bekas", "Botol plastik kosong"],
    answerIndex: 1,
    explanation: "Styrofoam bekas makanan tercatat sebagai residu di kamus sampah aplikasi ini. Cangkang telur organik, koran bekas dan botol kosong masuk Plastik / Kertas.",
  },
  {
    id: "res-8",
    category: "residu",
    question: "Sarung tangan sekali pakai yang sudah dipakai masuk ke slot mana?",
    options: ["Organik", "Plastik / Kertas", "Residu", "Tergantung warnanya"],
    answerIndex: 2,
    explanation: "Sarung tangan sekali pakai yang sudah dipakai tidak bisa didaur ulang biasa, jadi masuk residu.",
  },
  {
    id: "res-9",
    category: "residu",
    question: "Bungkus snack dan mi instan masuk ke slot mana?",
    options: ["Residu", "Plastik / Kertas", "Organik", "Slot mana saja"],
    answerIndex: 0,
    explanation: "Bungkus snack dan mi instan umumnya berlapis campuran bahan, jadi sulit didaur ulang dan masuk residu.",
  },
  {
    id: "res-10",
    category: "residu",
    question: "Kapan sampah boleh dibuang ke slot residu?",
    options: [
      "Kalau malas memilah",
      "Kalau tong lain terlihat penuh",
      "Kalau bukan organik dan bukan plastik atau kertas yang bersih dan kering",
      "Kalau sampahnya berwarna gelap",
    ],
    answerIndex: 2,
    explanation: "Residu adalah pilihan terakhir. Pilah organik dan daur ulang dulu, sisanya baru ke residu.",
  },
  {
    id: "res-11",
    category: "residu",
    question: "Mana pasangan yang keduanya masuk residu?",
    options: [
      "Masker bekas dan puntung rokok",
      "Masker bekas dan kulit pisang",
      "Puntung rokok dan kardus kering",
      "Tisu bekas dan botol plastik bersih",
    ],
    answerIndex: 0,
    explanation: "Masker bekas dan puntung rokok sama-sama tidak bisa dikomposkan maupun didaur ulang biasa. Kulit pisang organik, sedangkan kardus kering dan botol plastik bersih bisa didaur ulang.",
  },
  {
    id: "res-12",
    category: "residu",
    question: "Kenapa botol plastik bersih tidak boleh masuk residu?",
    options: [
      "Karena botol terlalu besar",
      "Karena botol tidak bisa dikosongkan",
      "Karena residu hanya untuk makanan",
      "Karena masih bisa didaur ulang",
    ],
    answerIndex: 3,
    explanation: "Plastik yang bersih masih bisa didaur ulang. Kosongkan dan bilas singkat, lalu masuk Plastik / Kertas.",
  },
];

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Soal yang baru dipakai per tong, supaya scan berikutnya di tong yang sama tidak mengulang soalnya. */
const lastAsked = new Map<BinCategory, string[]>();

/**
 * Picks random questions for a bin. The questions asked in the previous scan of the same bin
 * are left out while enough others remain. Call from an event handler or effect,
 * never during render, because it uses `Math.random`.
 */
export function pickQuestions(category: BinCategory, count = QUESTIONS_PER_SCAN): QuizQuestion[] {
  const pool = QUIZ_BANK.filter((q) => q.category === category);
  const previous = lastAsked.get(category) ?? [];
  const fresh = pool.filter((q) => !previous.includes(q.id));
  const picked = shuffle(fresh.length >= count ? fresh : pool).slice(0, count);
  lastAsked.set(
    category,
    picked.map((q) => q.id),
  );
  return picked;
}
