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
];

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Picks random questions for a bin. Call from an event handler or effect,
 * never during render, because it uses `Math.random`.
 */
export function pickQuestions(category: BinCategory, count = QUESTIONS_PER_SCAN): QuizQuestion[] {
  return shuffle(QUIZ_BANK.filter((q) => q.category === category)).slice(0, count);
}
