import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";
import { compressPhoto, hashFile } from "@/lib/photo";
import { findWasteItem } from "@/lib/data/items";
import seed from "@/lib/data/seed.json";
import {
  COOLDOWN_MS,
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
  CapacityStatus,
  DataSource,
  ExchangeRecord,
  ScanRecord,
  UserProfile,
} from "@/lib/types";

export const DEFAULT_LOCATIONS = seed.locations as CampusLocation[];

const CAPACITY_VALUES: CapacityStatus[] = ["Kosong", "Terisi", "Penuh"];

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
  const capacity = CAPACITY_VALUES.includes(data.statusCapacity) ? data.statusCapacity : "Kosong";
  return {
    locationId: id,
    name: String(data.name ?? id),
    coordinates: {
      x: Number(data.coordinates?.x ?? 50),
      y: Number(data.coordinates?.y ?? 50),
    },
    statusCapacity: capacity,
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
  photo: File | null;
}

export interface SubmitScanResult {
  scanId: string;
  breakdown: ScoreBreakdown;
  /** Points actually applied after the zero-balance floor. */
  applied: number;
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

    const { balance, applied } = applyToBalance(profile.poin, breakdown.net);
    const cooldownUntil = violatedCooldown ? (profile.cooldownUntil as number) : now + COOLDOWN_MS;
    const countsAsScan = breakdown.status !== "penalized";

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
      pointsEarned: applied,
      status: breakdown.status,
      penaltyReason: breakdown.penalty,
      timestamp: serverTimestamp(),
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
      totalScan: profile.totalScan + (countsAsScan ? 1 : 0),
      cooldownUntil: Timestamp.fromMillis(cooldownUntil),
    });

    return { scanId: scanRef.id, breakdown, applied, balance, cooldownUntil };
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

export async function fetchLocations(): Promise<CollectionResult<CampusLocation>> {
  const snap = await getDocs(collection(getDb(), "locations"));
  if (snap.empty) return { items: DEFAULT_LOCATIONS, source: "default" };
  return {
    items: snap.docs
      .map((d) => mapLocation(d.id, d.data()))
      .sort((a, b) => a.name.localeCompare(b.name)),
    source: "firestore",
  };
}
