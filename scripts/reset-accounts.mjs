// Resets every account to zero: poin, poinJSDP, totalScan and cooldownUntil on
// each `users` document. Name, prodi and email stay.
//
// Usage (same service account key as `npm run seed`, see its header):
//   1. Dry run, changes nothing and only counts what would be touched:
//        $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"; npm run reset:accounts
//   2. Apply:
//        npm run reset:accounts -- --apply
//   3. Apply and also delete the activity history (collections `scans`,
//      `scanPhotos`, `exchanges`) so the dashboard starts empty:
//        npm run reset:accounts -- --apply --history
//
// This cannot be undone. The target project comes from .firebaserc, and the
// script stops if the key belongs to another project.
import { readFileSync } from "node:fs";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const FLAGS = new Set(["--apply", "--history"]);
const args = process.argv.slice(2);
const unknown = args.filter((arg) => !FLAGS.has(arg));
if (unknown.length > 0) {
  console.error(`Opsi tidak dikenal: ${unknown.join(", ")}. Yang tersedia: --apply, --history.`);
  process.exit(1);
}
const apply = args.includes("--apply");
const withHistory = args.includes("--history");

const readJson = (url) => JSON.parse(readFileSync(url, "utf8"));
const targetProject = readJson(new URL("../.firebaserc", import.meta.url)).projects.default;

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error(
    "GOOGLE_APPLICATION_CREDENTIALS belum diatur. Lihat petunjuk di bagian atas file ini.",
  );
  process.exit(1);
}
const keyProject = readJson(keyPath).project_id;
if (keyProject !== targetProject) {
  console.error(
    `Key ini milik proyek "${keyProject}", padahal targetnya "${targetProject}". Unduh key dari proyek yang benar.`,
  );
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: targetProject });
const db = getFirestore();

const countOf = async (name) => (await db.collection(name).count().get()).data().count;

const userCount = await countOf("users");
const historyNames = ["scans", "scanPhotos", "exchanges"];
const historyCounts = withHistory
  ? Object.fromEntries(await Promise.all(historyNames.map(async (n) => [n, await countOf(n)])))
  : {};

console.log(`Proyek: ${targetProject}`);
console.log(`Akun yang direset ke 0: ${userCount}`);
if (withHistory) {
  for (const name of historyNames) console.log(`Dokumen ${name} yang dihapus: ${historyCounts[name]}`);
} else {
  console.log("Riwayat (scans, scanPhotos, exchanges) tidak disentuh. Tambahkan --history untuk menghapusnya.");
}

if (!apply) {
  console.log("\nDry run: tidak ada yang diubah. Tambahkan --apply untuk menjalankan.");
  process.exit(0);
}

const BATCH_SIZE = 400;
const userRefs = (await db.collection("users").select().get()).docs.map((d) => d.ref);
for (let i = 0; i < userRefs.length; i += BATCH_SIZE) {
  const batch = db.batch();
  for (const ref of userRefs.slice(i, i + BATCH_SIZE)) {
    batch.update(ref, { poin: 0, poinJSDP: 0, totalScan: 0, cooldownUntil: null });
  }
  await batch.commit();
}
console.log(`\n${userRefs.length} akun direset ke 0.`);

if (withHistory) {
  for (const name of historyNames) {
    await db.recursiveDelete(db.collection(name));
    console.log(`Koleksi ${name} dikosongkan.`);
  }
}
