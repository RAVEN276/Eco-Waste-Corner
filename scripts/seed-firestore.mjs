// Seeds the `locations` collection from lib/data/seed.json.
//
// Usage:
//   1. Firebase Console > Project settings > Service accounts > Generate new private key
//      (open the eco-waste-corner project, not another one)
//   2. Save it outside the repo, then run (PowerShell):
//        $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"; npm run seed
//
// Existing documents with the same id are overwritten. The target project comes
// from .firebaserc, and the script stops if the key belongs to another project.
import { readFileSync } from "node:fs";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const readJson = (url) => JSON.parse(readFileSync(url, "utf8"));
const seed = readJson(new URL("../lib/data/seed.json", import.meta.url));
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

const batch = db.batch();
for (const location of seed.locations) {
  batch.set(db.collection("locations").doc(location.locationId), location);
}

await batch.commit();
console.log(`Seeded ${seed.locations.length} locations into "${targetProject}".`);
