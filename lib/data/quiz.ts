import bankJson from "@/lib/data/quiz-bank.json";
import type { BinCategory, QuizQuestion } from "@/lib/types";

export const QUESTIONS_PER_SCAN = 2;

/**
 * Bank soal bawaan. Sumber utamanya koleksi `quizQuestions` di Firestore: daftar ini dipakai bila koleksi itu
 * kosong, belum lengkap, atau gagal dimuat, dan sebagai isi awal untuk `npm run seed`.
 */
export const DEFAULT_QUIZ_BANK = bankJson as QuizQuestion[];

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
 * Picks random questions for a bin from `bank`, skipping the previous scan's questions while enough others remain.
 * Uses `Math.random`, so call it from an event handler or effect, never during render.
 */
export function pickQuestions(
  bank: QuizQuestion[],
  category: BinCategory,
  count = QUESTIONS_PER_SCAN,
): QuizQuestion[] {
  const pool = bank.filter((q) => q.category === category);
  const previous = lastAsked.get(category) ?? [];
  const fresh = pool.filter((q) => !previous.includes(q.id));
  const picked = shuffle(fresh.length >= count ? fresh : pool).slice(0, count);
  lastAsked.set(
    category,
    picked.map((q) => q.id),
  );
  return picked;
}
