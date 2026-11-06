// Membuat kode QR untuk setiap tong di setiap lokasi: dua lokasi dikali tiga tong, jadi enam kode.
// Lokasinya dibaca dari lib/data/seed.json (id yang sama dengan koleksi `locations` di Firestore).
//
// Isi tiap QR adalah tautan ke halaman scan, bentuknya sama dengan lib/qr.ts:
//   https://<domain>/scan?lokasi=spot-a&tong=organik
//
// Pemakaian, setelah aplikasi di-deploy dan alamat https-nya sudah pasti:
//   npm run qr -- --base https://eco-waste-corner.vercel.app
//
// Hasilnya ada di folder qr-print (tidak ikut git):
//   index.html           lembar cetak A4, satu halaman per lokasi, buka di browser lalu cetak
//   <lokasi>_<tong>.svg  vektor, tajam di ukuran berapa pun (disarankan untuk dicetak)
//   <lokasi>_<tong>.png  gambar biasa, kalau percetakan meminta PNG
//
// Opsi:
//   --base <url>   alamat dasar aplikasi, wajib (atau isi env QR_BASE_URL). Harus https, kecuali localhost
//   --out <folder> folder hasil, bawaannya qr-print
//
// Kalau alamat aplikasi berubah, QR yang sudah ditempel harus dicetak ulang, karena alamatnya ikut tertanam.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import QRCode from "qrcode";

const args = process.argv.slice(2);
const KNOWN = ["--base", "--out"];
const unknown = args.filter((arg, index) => arg.startsWith("--") && !KNOWN.includes(arg) && !KNOWN.includes(args[index - 1]));
if (unknown.length > 0) {
  console.error(`Opsi tidak dikenal: ${unknown.join(", ")}. Yang tersedia: ${KNOWN.join(", ")}.`);
  process.exit(1);
}
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const base = option("--base") ?? process.env.QR_BASE_URL;
if (!base) {
  console.error("Alamat aplikasi belum diisi. Contoh: npm run qr -- --base https://eco-waste-corner.vercel.app");
  process.exit(1);
}
let baseUrl;
try {
  baseUrl = new URL(base);
} catch {
  console.error(`Alamat tidak valid: ${base}`);
  process.exit(1);
}
const local = baseUrl.hostname === "localhost" || baseUrl.hostname === "127.0.0.1";
if (baseUrl.protocol !== "https:" && !local) {
  console.error("Alamatnya harus https. Browser ponsel hanya mengizinkan kamera di alamat https, jadi pemindai dan foto bukti tidak akan jalan.");
  process.exit(1);
}

// Sama dengan BINS di lib/data/bins.ts: id dipakai di tautan, warna mengikuti kode warna tong.
const BINS = [
  { id: "organik", label: "Organik", fill: "#1E7A4B", text: "#FFFFFF" },
  { id: "plastik_kertas", label: "Plastik / Kertas", fill: "#F4B81E", text: "#12182B" },
  { id: "residu", label: "Residu", fill: "#363C4A", text: "#FFFFFF" },
];

const seed = JSON.parse(readFileSync(new URL("../lib/data/seed.json", import.meta.url), "utf8"));
const locations = seed.locations.map(({ locationId, name }) => ({ locationId, name }));

const scanUrl = (locationId, binId) => {
  const url = new URL("/scan", baseUrl);
  url.searchParams.set("lokasi", locationId);
  url.searchParams.set("tong", binId);
  return url.toString();
};

const escapeHtml = (text) => text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

const outDir = resolve(option("--out") ?? "qr-print");
mkdirSync(outDir, { recursive: true });

// Tingkat koreksi Q: kode yang tergores atau kotor karena ditempel di luar ruangan masih terbaca.
const QR_OPTIONS = { errorCorrectionLevel: "Q", margin: 4 };

const cards = [];
for (const location of locations) {
  for (const bin of BINS) {
    const url = scanUrl(location.locationId, bin.id);
    const name = `${location.locationId}_${bin.id}`;
    const svg = await QRCode.toString(url, { ...QR_OPTIONS, type: "svg" });
    writeFileSync(join(outDir, `${name}.svg`), svg);
    await QRCode.toFile(join(outDir, `${name}.png`), url, { ...QR_OPTIONS, scale: 16 });
    cards.push({ location, bin, url, svg });
  }
}

const pages = locations
  .map((location) => {
    const strips = cards
      .filter((card) => card.location.locationId === location.locationId)
      .map(
        (card) => `
      <section class="strip" style="--fill:${card.bin.fill};--on:${card.bin.text}">
        <div class="label">
          <p class="where">${escapeHtml(location.name)}</p>
          <h2>${escapeHtml(card.bin.label)}</h2>
          <p class="how">Pindai dengan kamera ponsel, lalu ikuti langkahnya di aplikasi Eco Waste Corner UPJ.</p>
        </div>
        <div class="code">${card.svg}</div>
      </section>`,
      )
      .join("");
    return `<div class="page">${strips}\n    </div>`;
  })
  .join("\n    ");

const linkList = cards
  .map((card) => `<li><strong>${escapeHtml(card.location.name)}, ${escapeHtml(card.bin.label)}</strong><br><code>${escapeHtml(card.url)}</code></li>`)
  .join("");

writeFileSync(
  join(outDir, "index.html"),
  `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR tong Eco Waste Corner UPJ</title>
  <style>
    @page { size: A4; margin: 1.5cm; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f5f4ef; color: #12182b; font-family: Arial, Helvetica, sans-serif; }
    .page { width: 21cm; margin: 0 auto; padding: 1.5cm; display: flex; flex-direction: column; gap: 0.5cm; break-after: page; }
    .strip { display: grid; grid-template-columns: 1fr 8cm; height: 8.2cm; border: 3px solid #12182b; border-radius: 0.4cm; overflow: hidden; background: var(--fill); color: var(--on); }
    .label { padding: 0.8cm; display: flex; flex-direction: column; justify-content: space-between; }
    .where { margin: 0; font-size: 12pt; font-weight: 700; }
    h2 { margin: 0; font-family: "Arial Narrow", Arial, sans-serif; font-size: 40pt; line-height: 1; font-weight: 800; }
    .how { margin: 0; font-size: 10pt; line-height: 1.35; }
    .code { background: #fff; padding: 0.4cm; border-left: 3px solid #12182b; }
    .code svg { display: block; width: 100%; height: 100%; }
    .links { width: 21cm; margin: 0 auto; padding: 1cm 1.5cm; font-size: 10pt; }
    .links code { word-break: break-all; }
    @media print { body { background: none; } .page { padding: 0; width: auto; } .links { display: none; } }
  </style>
</head>
<body>
    ${pages}
  <aside class="links">
    <h3>Tautan di dalam kode (hanya tampil di layar, tidak ikut tercetak)</h3>
    <ol>${linkList}</ol>
  </aside>
</body>
</html>
`,
);

console.log(`Dibuat ${cards.length} kode QR di ${outDir}\n`);
for (const card of cards) {
  console.log(`${card.location.name.padEnd(32)} ${card.bin.label.padEnd(17)} ${card.url}`);
}
console.log("\nBuka index.html di browser, lalu cetak (ukuran kertas A4, skala 100%, aktifkan 'background graphics').");
