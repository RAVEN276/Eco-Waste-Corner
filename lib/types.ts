export type BinCategory = "organik" | "plastik_kertas" | "residu";

export type ScanStatus = "verified" | "unverified" | "penalized";

export type PenaltyReason = "item_mismatch" | "duplicate_photo" | "cooldown_violation";

export interface UserProfile {
  uid: string;
  email: string;
  nama: string;
  prodi: string;
  /** Points earned from scans. Can be exchanged for JSDP points. */
  poin: number;
  /** JSDP points. Graduation requirement, only grows through an exchange. */
  poinJSDP: number;
  totalScan: number;
  /** Epoch millis. Scanning is blocked until this moment. */
  cooldownUntil: number | null;
  createdAt: number | null;
}

export interface ScanRecord {
  scanId: string;
  userId: string;
  categoryBin: BinCategory;
  location: string;
  locationName: string;
  photoUrl: string;
  photoHash: string;
  itemType: string;
  quizAnswered: boolean;
  quizCorrect: number;
  quizTotal: number;
  /** Net change applied to the balance. Negative when penalised. */
  pointsEarned: number;
  status: ScanStatus;
  penaltyReason: PenaltyReason | null;
  timestamp: number;
  /** Tebakan pengenal foto saat scan. Hanya catatan, tidak memengaruhi poin. Null bila tidak ada. */
  mlSuggestion: MlSuggestion | null;
  /** Jawaban per soal yang dilaporkan klien. Null untuk scan lama yang hanya menyimpan skor. */
  quizAnswers: QuizAnswerRecord[] | null;
  /** Keputusan admin. Null berarti belum ditinjau. */
  review: ScanReview | null;
}

/** Tebakan model pengenal sampah (lib/ml/classify.ts) untuk satu foto bukti. */
export interface MlSuggestion {
  /** Kelas model, misalnya "botol-plastik" atau "paper". */
  classId: string;
  /** Keyakinan 0 sampai 1. */
  confidence: number;
  /** Id barang di SCAN_ITEMS yang sepadan dengan kelasnya, atau null bila tidak ada padanan. */
  itemId: string | null;
  /**
   * Tong untuk kelas tebakan, atau null bila kelasnya tidak punya tong (misalnya kaca atau logam).
   * Dokumen dari model sebelum sampah-v3 tidak punya field ini dan dibaca sebagai null.
   */
  binId: BinCategory | null;
  /** True bila tebakan cukup yakin dan punya padanan, sehingga ditawarkan sebagai saran. */
  suggested: boolean;
  /** True bila jenis sampah yang dikirim sama dengan saran. */
  accepted: boolean;
  modelVersion: string;
  /** Lama memuat runtime dan model di sesi ini, dalam milidetik. */
  loadMs: number;
  /** Lama satu tebakan, dalam milidetik. */
  inferMs: number;
}

/** Satu jawaban kuis. Teksnya disalin, supaya tetap terbaca bila bank soal berubah. */
export interface QuizAnswerRecord {
  questionId: string;
  question: string;
  chosen: string;
  correct: string;
  isCorrect: boolean;
}

export type ReviewDecision = "approved" | "rejected";

/** Keputusan admin atas satu scan. Hanya mencatat tinjauan: tidak mengubah poin pengguna. */
export interface ScanReview {
  status: ReviewDecision;
  note: string;
  reviewedBy: string;
  /** Epoch millis. Null sesaat setelah disimpan, sebelum server menetapkan waktunya. */
  reviewedAt: number | null;
}

export interface ExchangeRecord {
  exchangeId: string;
  userId: string;
  poinSpent: number;
  jsdpGained: number;
  timestamp: number;
}

export interface LocationCoordinates {
  /** Horizontal position on the schematic map, 0 to 100. */
  x: number;
  /** Vertical position on the schematic map, 0 to 100. */
  y: number;
}

export interface CampusLocation {
  locationId: string;
  name: string;
  coordinates: LocationCoordinates;
  imageUrl: string;
  routeSteps: string[];
}

export interface QuizQuestion {
  id: string;
  category: BinCategory;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

/** Cara barang yang salah tong terlontar: `arah` 1 ke kanan atau -1 ke kiri, `putar` sudut rebahnya saat mendarat (derajat). */
export interface Rejection {
  arah: 1 | -1;
  putar: number;
}

export interface WasteItem {
  id: string;
  label: string;
  category: BinCategory;
}

export type DataSource = "firestore" | "default";
