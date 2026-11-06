export type BinCategory = "organik" | "plastik_kertas" | "residu";

export type CapacityStatus = "Kosong" | "Terisi" | "Penuh";

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
  statusCapacity: CapacityStatus;
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

export interface WasteItem {
  id: string;
  label: string;
  category: BinCategory;
}

export type DataSource = "firestore" | "default";
