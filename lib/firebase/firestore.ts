import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase/config";
import { compressPhoto, hashFile } from "@/lib/photo";
import { BIN_LIST, isBinCategory } from "@/lib/data/bins";
import { findWasteItem } from "@/lib/data/items";
import { DEFAULT_QUIZ_BANK, QUESTIONS_PER_SCAN } from "@/lib/data/quiz";
import seed from "@/lib/data/seed.json";
import {
  COOLDOWN_MS,
  PENALTY_COOLDOWN_MS,
  PENALTY_LABEL,
  PENALTY_POINTS,
  applyToBalance,
  calculateScore,
  exchangeQuote,
  isCoolingDown,
  type ScoreBreakdown,
} from "@/lib/scoring";
import type {
  BinCategory,
  CampusLocation,
  DataSource,
  ExchangeRecord,
  MlSuggestion,
  QuizAnswerRecord,
  QuizQuestion,
  ReviewDecision,
  ScanRecord,
  ScanReview,
  UserProfile,
} from "@/lib/types";

export const DEFAULT_LOCATIONS = seed.locations as CampusLocation[];

function toMillis(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return null;
}

function mapUser(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    email: String(data.email ?? ""),
    nama: String(data.nama ?? ""),
    prodi: String(data.prodi ?? ""),
    poin: Number(data.poin ?? 0),
    poinJSDP: Number(data.poinJSDP ?? 0),
    totalScan: Number(data.totalScan ?? 0),
    cooldownUntil: toMillis(data.cooldownUntil),
    createdAt: toMillis(data.createdAt),
  };
}

/** Jawaban per soal. Entri yang bentuknya salah dilewati, dan tanpa satu pun yang valid hasilnya null. */
function mapQuizAnswers(raw: unknown): QuizAnswerRecord[] | null {
  if (!Array.isArray(raw)) return null;
  const answers: QuizAnswerRecord[] = [];
  for (const item of raw) {
    if (item === null || typeof item !== "object") continue;
    const a = item as Record<string, unknown>;
    answers.push({
      questionId: String(a.questionId ?? ""),
      question: String(a.question ?? ""),
      chosen: String(a.chosen ?? ""),
      correct: String(a.correct ?? ""),
      isCorrect: Boolean(a.isCorrect),
    });
  }
  return answers.length > 0 ? answers : null;
}

function mapReview(raw: unknown): ScanReview | null {
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.status !== "approved" && r.status !== "rejected") return null;
  return {
    status: r.status,
    note: String(r.note ?? ""),
    reviewedBy: String(r.reviewedBy ?? ""),
    reviewedAt: toMillis(r.reviewedAt),
  };
}

function mapScan(id: string, data: DocumentData): ScanRecord {
  return {
    scanId: id,
    userId: String(data.userId ?? ""),
    categoryBin: data.categoryBin as BinCategory,
    location: String(data.location ?? ""),
    locationName: String(data.locationName ?? ""),
    photoUrl: String(data.photoUrl ?? ""),
    photoHash: String(data.photoHash ?? ""),
    itemType: String(data.itemType ?? ""),
    quizAnswered: Boolean(data.quizAnswered),
    quizCorrect: Number(data.quizCorrect ?? 0),
    quizTotal: Number(data.quizTotal ?? 0),
    pointsEarned: Number(data.pointsEarned ?? 0),
    status: data.status ?? "unverified",
    penaltyReason: data.penaltyReason ?? null,
    timestamp: toMillis(data.timestamp) ?? 0,
    mlSuggestion: mapMlSuggestion(data.mlSuggestion),
    quizAnswers: mapQuizAnswers(data.quizAnswers),
    review: mapReview(data.review),
  };
}

function mapMlSuggestion(value: unknown): MlSuggestion | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  return {
    classId: String(data.classId ?? ""),
    confidence: Number(data.confidence ?? 0),
    itemId: typeof data.itemId === "string" ? data.itemId : null,
    binId: isBinCategory(data.binId) ? data.binId : null,
    suggested: Boolean(data.suggested),
    accepted: Boolean(data.accepted),
    modelVersion: String(data.modelVersion ?? ""),
    loadMs: Number(data.loadMs ?? 0),
    inferMs: Number(data.inferMs ?? 0),
    blockedTries: Number(data.blockedTries ?? 0),
  };
}

function mapExchange(id: string, data: DocumentData): ExchangeRecord {
  return {
    exchangeId: id,
    userId: String(data.userId ?? ""),
    poinSpent: Number(data.poinSpent ?? 0),
    jsdpGained: Number(data.jsdpGained ?? 0),
    timestamp: toMillis(data.timestamp) ?? 0,
  };
}

function mapLocation(id: string, data: DocumentData): CampusLocation {
  return {
    locationId: id,
    name: String(data.name ?? id),
    coordinates: {
      x: Number(data.coordinates?.x ?? 50),
      y: Number(data.coordinates?.y ?? 50),
    },
    imageUrl: String(data.imageUrl ?? ""),
    routeSteps: Array.isArray(data.routeSteps) ? data.routeSteps.map(String) : [],
  };
}

/* ---------------------------------- users --------------------------------- */

export async function ensureUserProfile(identity: {
  uid: string;
  email: string;
  displayName: string | null;
}): Promise<void> {
  const ref = doc(getDb(), "users", identity.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    uid: identity.uid,
    email: identity.email,
    nama: identity.displayName ?? identity.email.split("@")[0],
    prodi: "",
    poin: 0,
    poinJSDP: 0,
    totalScan: 0,
    cooldownUntil: null,
    createdAt: serverTimestamp(),
  });
}

export function subscribeUser(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getDb(), "users", uid),
    { includeMetadataChanges: false },
    (snap) =>
      onData(snap.exists() ? mapUser(uid, snap.data({ serverTimestamps: "estimate" })) : null),
    onError,
  );
}

export async function updateProfile(
  uid: string,
  values: { nama: string; prodi: string },
): Promise<void> {
  await updateDoc(doc(getDb(), "users", uid), {
    nama: values.nama.trim(),
    prodi: values.prodi.trim(),
  });
}

/* ---------------------------------- scans --------------------------------- */

export function subscribeScans(
  uid: string,
  onData: (scans: ScanRecord[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  // Sorted on the client so no composite index is needed.
  return onSnapshot(
    query(collection(getDb(), "scans"), where("userId", "==", uid)),
    (snap) => {
      const scans = snap.docs
        .map((d) => mapScan(d.id, d.data({ serverTimestamps: "estimate" })))
        .sort((a, b) => b.timestamp - a.timestamp);
      onData(scans);
    },
    onError,
  );
}

/** Returns the stored proof photo as a data URL, or null when none was kept. */
export async function fetchScanPhoto(scanId: string): Promise<string | null> {
  const snap = await getDoc(doc(getDb(), "scanPhotos", scanId));
  if (!snap.exists()) return null;
  const dataUrl = snap.data().dataUrl;
  return typeof dataUrl === "string" && dataUrl.startsWith("data:image/") ? dataUrl : null;
}

/* ----------------------------- admin: tinjauan scan ----------------------------- */

export const ADMIN_PAGE_SIZE = 50;

export interface AdminScanPage {
  scans: ScanRecord[];
  /** Penanda untuk halaman berikutnya, dipakai sebagai argumen `fetchAdminScans`. */
  cursor: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Scan semua pengguna, terbaru dulu, satu halaman per panggilan. Hanya akun admin yang diizinkan
 * aturan Firestore. Foto tidak ikut dimuat: ukurannya besar, jadi diambil satu per satu lewat `fetchScanPhoto`.
 */
export async function fetchAdminScans(after: QueryDocumentSnapshot | null): Promise<AdminScanPage> {
  const scans = collection(getDb(), "scans");
  const snap = await getDocs(
    after
      ? query(scans, orderBy("timestamp", "desc"), startAfter(after), limit(ADMIN_PAGE_SIZE))
      : query(scans, orderBy("timestamp", "desc"), limit(ADMIN_PAGE_SIZE)),
  );
  assertReachable(snap);
  return {
    scans: snap.docs.map((d) => mapScan(d.id, d.data({ serverTimestamps: "estimate" }))),
    cursor: snap.docs[snap.docs.length - 1] ?? after,
    hasMore: snap.docs.length === ADMIN_PAGE_SIZE,
  };
}

const IN_QUERY_LIMIT = 10;

/** Profil beberapa pengguna sekaligus, untuk menampilkan nama di daftar scan. Yang tidak ditemukan tidak ikut. */
export async function fetchUsersByIds(uids: string[]): Promise<Map<string, UserProfile>> {
  const users = new Map<string, UserProfile>();
  for (let i = 0; i < uids.length; i += IN_QUERY_LIMIT) {
    const chunk = uids.slice(i, i + IN_QUERY_LIMIT);
    const snap = await getDocs(query(collection(getDb(), "users"), where(documentId(), "in", chunk)));
    snap.forEach((d) => users.set(d.id, mapUser(d.id, d.data())));
  }
  return users;
}

/**
 * Menyimpan keputusan admin pada satu scan sekaligus memperbarui saldo poin dan `totalScan`
 * pengguna dalam satu transaksi. Poin positif dari scan baru masuk ke saldo saat `approved`;
 * jika `rejected`, pengguna tidak mendapat poin tersebut (atau ditarik kembali bila sebelumnya
 * pernah disetujui). Scan penalti tidak berubah poinnya saat ditinjau.
 */
export async function saveScanReview(
  scanId: string,
  decision: ReviewDecision,
  note: string,
): Promise<ScanReview> {
  const email = getFirebaseAuth().currentUser?.email;
  if (!email) throw new Error("Sesi login tidak ditemukan. Masuk lagi lalu coba lagi.");
  const trimmed = note.trim();
  const db = getDb();
  const scanRef = doc(db, "scans", scanId);

  await runTransaction(db, async (tx) => {
    const scanSnap = await tx.get(scanRef);
    if (!scanSnap.exists()) throw new Error("Data scan tidak ditemukan.");
    const scan = mapScan(scanSnap.id, scanSnap.data());
    const userRef = doc(db, "users", scan.userId);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("Profil pengguna tidak ditemukan.");
    const profile = mapUser(scan.userId, userSnap.data());

    const wasApproved = scan.review?.status === "approved";
    const willBeApproved = decision === "approved";
    const countsAsValidScan = scan.status !== "penalized";

    let nextPoin = profile.poin;
    let nextTotalScan = profile.totalScan;

    if (!wasApproved && willBeApproved) {
      if (scan.pointsEarned > 0) nextPoin = profile.poin + scan.pointsEarned;
      if (countsAsValidScan) nextTotalScan = profile.totalScan + 1;
    } else if (wasApproved && !willBeApproved) {
      if (scan.pointsEarned > 0) nextPoin = Math.max(0, profile.poin - scan.pointsEarned);
      if (countsAsValidScan) nextTotalScan = Math.max(0, profile.totalScan - 1);
    }

    tx.update(scanRef, {
      review: { status: decision, note: trimmed, reviewedBy: email, reviewedAt: serverTimestamp() },
    });

    if (nextPoin !== profile.poin || nextTotalScan !== profile.totalScan) {
      tx.update(userRef, { poin: nextPoin, totalScan: nextTotalScan });
    }
  });

  return { status: decision, note: trimmed, reviewedBy: email, reviewedAt: Date.now() };
}

async function photoHashExists(uid: string, hash: string): Promise<boolean> {
  const snap = await getDocs(
    query(
      collection(getDb(), "scans"),
      where("userId", "==", uid),
      where("photoHash", "==", hash),
      limit(1),
    ),
  );
  return !snap.empty;
}

export interface SubmitScanInput {
  uid: string;
  category: BinCategory;
  locationId: string;
  locationName: string;
  itemId: string;
  quizCorrect: number;
  quizTotal: number;
  /** Jawaban per soal, supaya admin bisa memeriksanya. Dilaporkan klien, jadi bukan bukti. */
  quizAnswers: QuizAnswerRecord[];
  photo: File | null;
  mlSuggestion: MlSuggestion | null;
}

export interface SubmitScanResult {
  scanId: string;
  breakdown: ScoreBreakdown;
  /** Immediate point delta applied to balance (negative on penalty, 0 while waiting for admin approval). */
  applied: number;
  /** Original positive points recorded on the scan, awarded once admin approves. */
  pendingPoints: number;
  balance: number;
  cooldownUntil: number;
}

export async function submitScan(input: SubmitScanInput): Promise<SubmitScanResult> {
  const db = getDb();
  const item = findWasteItem(input.itemId);
  if (!item) throw new Error("Jenis sampah tidak dikenali. Pilih salah satu dari daftar.");

  let photoHash = "";
  let duplicatePhoto = false;
  if (input.photo) {
    photoHash = await hashFile(input.photo);
    duplicatePhoto = await photoHashExists(input.uid, photoHash);
  }

  let breakdown = calculateScore({
    category: input.category,
    quizCorrect: input.quizCorrect,
    quizTotal: input.quizTotal,
    hasPhoto: Boolean(input.photo),
    itemMatchesBin: item.category === input.category,
    duplicatePhoto,
  });

  const scanRef = doc(collection(db, "scans"));
  const photoRef = doc(db, "scanPhotos", scanRef.id);
  // A duplicate photo is not stored again: the earlier scan already holds it.
  const photoData = input.photo && !duplicatePhoto ? await compressPhoto(input.photo) : "";
  // `photoUrl` holds the Firestore path of the stored photo, not a download URL.
  const photoUrl = photoData ? photoRef.path : "";

  const userRef = doc(db, "users", input.uid);

  return runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("Profil tidak ditemukan. Muat ulang halaman.");
    const profile = mapUser(input.uid, userSnap.data());

    const now = Date.now();
    const violatedCooldown = isCoolingDown(profile.cooldownUntil, now);

    if (violatedCooldown) {
      breakdown = {
        base: breakdown.base,
        tier: "nol",
        tierLabel: PENALTY_LABEL.cooldown_violation,
        earned: 0,
        penalty: "cooldown_violation",
        penaltyPoints: PENALTY_POINTS.cooldown_violation,
        net: -PENALTY_POINTS.cooldown_violation,
        status: "penalized",
      };
    }

    const isPenalized = breakdown.status === "penalized";
    const { balance, applied } = isPenalized
      ? applyToBalance(profile.poin, breakdown.net)
      : { balance: profile.poin, applied: 0 };
    const pendingPoints = isPenalized ? 0 : breakdown.net;
    const pointsRecorded = isPenalized ? applied : breakdown.net;
    const cooldownUntil = isPenalized
      ? Math.max(profile.cooldownUntil ?? 0, now + PENALTY_COOLDOWN_MS)
      : now + COOLDOWN_MS;

    tx.set(scanRef, {
      scanId: scanRef.id,
      userId: input.uid,
      categoryBin: input.category,
      location: input.locationId,
      locationName: input.locationName,
      photoUrl,
      photoHash,
      itemType: item.id,
      quizAnswered: true,
      quizCorrect: input.quizCorrect,
      quizTotal: input.quizTotal,
      quizAnswers: input.quizAnswers,
      pointsEarned: pointsRecorded,
      status: breakdown.status,
      penaltyReason: breakdown.penalty,
      timestamp: serverTimestamp(),
      mlSuggestion: input.mlSuggestion,
    });

    if (photoData) {
      tx.set(photoRef, {
        scanId: scanRef.id,
        userId: input.uid,
        mime: "image/jpeg",
        dataUrl: photoData,
        timestamp: serverTimestamp(),
      });
    }

    tx.update(userRef, {
      poin: balance,
      totalScan: profile.totalScan,
      cooldownUntil: Timestamp.fromMillis(cooldownUntil),
    });

    return { scanId: scanRef.id, breakdown, applied, pendingPoints, balance, cooldownUntil };
  });
}

/* -------------------------------- exchanges -------------------------------- */

export function subscribeExchanges(
  uid: string,
  onData: (exchanges: ExchangeRecord[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(getDb(), "exchanges"), where("userId", "==", uid)),
    (snap) => {
      const exchanges = snap.docs
        .map((d) => mapExchange(d.id, d.data({ serverTimestamps: "estimate" })))
        .sort((a, b) => b.timestamp - a.timestamp);
      onData(exchanges);
    },
    onError,
  );
}

export interface SubmitExchangeResult {
  exchangeId: string;
  poinSpent: number;
  jsdpGained: number;
  /** Points left after the exchange. */
  poin: number;
  poinJSDP: number;
}

/** Turns `packages` packages of points into JSDP points. The balance is re-read inside the transaction. */
export async function submitExchange(input: {
  uid: string;
  packages: number;
}): Promise<SubmitExchangeResult> {
  if (!Number.isInteger(input.packages) || input.packages < 1) {
    throw new Error("Jumlah penukaran tidak valid.");
  }
  const db = getDb();
  const { spent, gained } = exchangeQuote(input.packages);
  const userRef = doc(db, "users", input.uid);
  const exchangeRef = doc(collection(db, "exchanges"));

  return runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("Profil tidak ditemukan. Muat ulang halaman.");
    const profile = mapUser(input.uid, userSnap.data());
    if (profile.poin < spent) {
      throw new Error(`Poin tidak cukup. Poinmu ${profile.poin}, penukaran ini butuh ${spent}.`);
    }

    const poin = profile.poin - spent;
    const poinJSDP = profile.poinJSDP + gained;

    tx.set(exchangeRef, {
      exchangeId: exchangeRef.id,
      userId: input.uid,
      poinSpent: spent,
      jsdpGained: gained,
      timestamp: serverTimestamp(),
    });
    tx.update(userRef, { poin, poinJSDP });

    return { exchangeId: exchangeRef.id, poinSpent: spent, jsdpGained: gained, poin, poinJSDP };
  });
}

/* ------------------------------ locations (read) --------------------------- */

export interface CollectionResult<T> {
  items: T[];
  source: DataSource;
}

/**
 * Tanpa koneksi, getDocs tidak menolak: ia mengembalikan hasil kosong dari cache. Itu bukan koleksi kosong,
 * jadi dilaporkan sebagai server tidak terjangkau supaya pesannya tidak menyesatkan.
 */
function assertReachable(snap: { empty: boolean; metadata: { fromCache: boolean } }): void {
  if (snap.empty && snap.metadata.fromCache) throw { code: "unavailable" };
}

export async function fetchLocations(): Promise<CollectionResult<CampusLocation>> {
  const snap = await getDocs(collection(getDb(), "locations"));
  assertReachable(snap);
  if (snap.empty) return { items: DEFAULT_LOCATIONS, source: "default" };
  return {
    items: snap.docs
      .map((d) => mapLocation(d.id, d.data()))
      .sort((a, b) => a.name.localeCompare(b.name)),
    source: "firestore",
  };
}

/* ------------------------------ quiz bank (read) --------------------------- */

/** Dokumen yang rusak (kategori tak dikenal, opsi kurang, indeks jawaban di luar opsi) dilewati, bukan ditampilkan separuh. */
function mapQuiz(id: string, data: DocumentData): QuizQuestion | null {
  const category = BIN_LIST.find((bin) => bin.id === data.category)?.id;
  const question = typeof data.question === "string" ? data.question.trim() : "";
  const options = Array.isArray(data.options) ? data.options.map(String) : [];
  const answerIndex = Number(data.answerIndex);
  const valid =
    category !== undefined &&
    question !== "" &&
    options.length >= 2 &&
    Number.isInteger(answerIndex) &&
    answerIndex >= 0 &&
    answerIndex < options.length;
  if (!valid) return null;
  return { id, category, question, options, answerIndex, explanation: String(data.explanation ?? "") };
}

function coversEveryBin(questions: QuizQuestion[]): boolean {
  return BIN_LIST.every((bin) => questions.filter((q) => q.category === bin.id).length >= QUESTIONS_PER_SCAN);
}

// Seluruh bank dibaca sekali per 15 menit per tab, bukan tiap membuka /scan.
const QUIZ_CACHE_MS = 15 * 60 * 1000;
let quizCache: { at: number; result: CollectionResult<QuizQuestion> } | null = null;

export function clearQuizCache(): void {
  quizCache = null;
}

/**
 * Soal kuis dari koleksi `quizQuestions`. Bila koleksinya kosong atau ada tong yang soalnya kurang dari satu scan,
 * hasilnya bank bawaan dengan `source: "default"`, supaya langkah kuis tidak pernah kosong.
 */
export async function fetchQuizQuestions(): Promise<CollectionResult<QuizQuestion>> {
  if (quizCache && Date.now() - quizCache.at < QUIZ_CACHE_MS) return quizCache.result;
  const snap = await getDocs(collection(getDb(), "quizQuestions"));
  assertReachable(snap);
  const questions = snap.docs
    .map((d) => mapQuiz(d.id, d.data()))
    .filter((q): q is QuizQuestion => q !== null)
    .sort((a, b) => a.id.localeCompare(b.id));
  const result: CollectionResult<QuizQuestion> = coversEveryBin(questions)
    ? { items: questions, source: "firestore" }
    : { items: DEFAULT_QUIZ_BANK, source: "default" };
  quizCache = { at: Date.now(), result };
  return result;
}
