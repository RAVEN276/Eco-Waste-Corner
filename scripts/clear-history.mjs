// Deletes the waste disposal history of every user: all documents in `scans`
// and their proof photos in `scanPhotos`, and sets `totalScan` back to 0 on every
// account, since badges and the "dari N scan" text are counted from it. Poin,
// poinJSDP and cooldownUntil stay as they are, and so does the exchange history
// (`exchanges`). To reset everything to 0, use `npm run reset:accounts`.
//
// Usage (same service account key as `npm run seed`, see its header):
//   1. Dry run, changes nothing and only counts what would be deleted:
//        $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"; npm run clear:history
//   2. Delete for real:
//        npm run clear:history -- --apply
//
// This cannot be undone. The target project comes from .firebaserc, and the
// script stops if the key belongs to another project.
import { readFileSync } from "node:fs";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const unknown = args.filter((arg) => arg !== "--apply");
if (unknown.length > 0) {
  console.error(`Opsi tidak dikenal: ${unknown.join(", ")}. Yang tersedia: --apply.`);
  process.exit(1);
}
const apply = args.includes("--apply");

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

const COLLECTIONS = ["scans", "scanPhotos"];
const countOf = async (name) => (await db.collection(name).count().get()).data().count;

console.log(`Proyek: ${targetProject}`);
for (const name of COLLECTIONS) console.log(`Dokumen ${name} yang dihapus: ${await countOf(name)}`);
console.log(`Akun yang jumlah scan (badge)-nya direset ke 0: ${await countOf("users")}`);

if (!apply) {
  console.log("\nDry run: tidak ada yang diubah atau dihapus. Tambahkan --apply untuk menjalankan.");
  process.exit(0);
}

for (const name of COLLECTIONS) {
  await db.recursiveDelete(db.collection(name));
  console.log(`Koleksi ${name} dikosongkan.`);
}

const BATCH_SIZE = 400;
const userRefs = (await db.collection("users").select().get()).docs.map((d) => d.ref);
for (let i = 0; i < userRefs.length; i += BATCH_SIZE) {
  const batch = db.batch();
  for (const ref of userRefs.slice(i, i + BATCH_SIZE)) batch.update(ref, { totalScan: 0 });
  await batch.commit();
}
console.log(`${userRefs.length} akun: jumlah scan direset ke 0.`);
