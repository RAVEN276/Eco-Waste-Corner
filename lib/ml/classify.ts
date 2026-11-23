import type { InferenceSession } from "onnxruntime-web/wasm";
import { isBinCategory } from "@/lib/data/bins";
import type { BinCategory, MlSuggestion } from "@/lib/types";

/**
 * Pengenal jenis sampah dari foto bukti, dijalankan di browser dengan onnxruntime-web (WASM).
 * Hasilnya hanya SARAN untuk pilihan jenis sampah: tidak mengubah poin dan tidak memberi penalti.
 *
 * Model dan urutan kelasnya ada di public/models/. Mengganti model berarti menaikkan versi di nama
 * berkas (ML_MODEL_VERSION), karena /models/* disajikan dengan cache immutable (next.config.ts).
 */
export const ML_MODEL_VERSION = "sampah-v3";
const MODEL_URL = `/models/${ML_MODEL_VERSION}.onnx`;
const LABELS_URL = `/models/${ML_MODEL_VERSION}.labels.json`;

/** Keyakinan minimum sebelum saran dipakai untuk mengisi pilihan. Nilai awal, disesuaikan dari data lapangan. */
export const SUGGEST_THRESHOLD = 0.6;

/**
 * Kelas model yang punya padanan barang di SCAN_ITEMS. Kelas lain (biological, trash, lainnya) mencakup
 * banyak barang berbeda, jadi hanya tongnya yang dipakai, barangnya tidak disarankan. plastik-bersih
 * (gelas, wadah, kantong plastik) disarankan sebagai gelas plastik, satu-satunya padanannya di form scan.
 */
const CLASS_TO_ITEM: Record<string, string> = {
  "botol-plastik": "botol-plastik",
  "plastik-bersih": "gelas-plastik",
  paper: "kardus-kertas",
  cardboard: "kardus-kertas",
};

// Cadangan bila env.versions.web tidak tersedia. Samakan dengan versi onnxruntime-web di package.json.
const ORT_VERSION_FALLBACK = "1.31.1";

interface ModelLabels {
  classes: string[];
  /** Tong kampus per kelas. Nilai selain tiga tong (misalnya "tidak-ada" untuk kaca dan logam) berarti tanpa tong. */
  bin_of?: Record<string, string>;
  preprocess: { resize_shorter_side: number; center_crop: number; mean: number[]; std: number[] };
}

interface LoadedModel {
  ort: typeof import("onnxruntime-web/wasm");
  session: InferenceSession;
  labels: ModelLabels;
  loadMs: number;
}

let loading: Promise<LoadedModel> | null = null;

function loadModel(): Promise<LoadedModel> {
  if (!loading) {
    loading = (async () => {
      const start = performance.now();
      const ort = await import("onnxruntime-web/wasm");
      // Berkas WASM diambil dari jsDelivr dengan versi yang sama persis dengan paket JS,
      // karena dokumentasi onnxruntime-web mewajibkan keduanya dari build yang sama.
      ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ort.env.versions.web ?? ORT_VERSION_FALLBACK}/dist/`;
      const [labels, session] = await Promise.all([
        fetch(LABELS_URL).then((res) => {
          if (!res.ok) throw new Error(`Label model tidak bisa dimuat (${res.status})`);
          return res.json() as Promise<ModelLabels>;
        }),
        ort.InferenceSession.create(MODEL_URL, { executionProviders: ["wasm"] }),
      ]);
      return { ort, session, labels, loadMs: performance.now() - start };
    })().catch((error: unknown) => {
      // Boleh dicoba lagi pada foto berikutnya (misalnya setelah koneksi kembali).
      loading = null;
      throw error;
    });
  }
  return loading;
}

/** Mengubah foto menjadi tensor sesuai labels.json: sisi pendek di-resize, center crop, normalisasi. */
async function toInput(model: LoadedModel, photo: Blob) {
  const { resize_shorter_side: shorter, center_crop: crop, mean, std } = model.labels.preprocess;
  const bitmap = await createImageBitmap(photo, { imageOrientation: "from-image" });
  try {
    const scale = shorter / Math.min(bitmap.width, bitmap.height);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = crop;
    canvas.height = crop;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas tidak tersedia");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, (crop - width) / 2, (crop - height) / 2, width, height);
    const { data } = ctx.getImageData(0, 0, crop, crop);
    const pixels = crop * crop;
    const input = new Float32Array(3 * pixels);
    for (let i = 0; i < pixels; i++) {
      for (let c = 0; c < 3; c++) input[c * pixels + i] = (data[i * 4 + c] / 255 - mean[c]) / std[c];
    }
    return new model.ort.Tensor("float32", input, [1, 3, crop, crop]);
  } finally {
    bitmap.close();
  }
}

/**
 * Menebak jenis sampah di foto. Hasil `suggested` true hanya bila kelasnya punya padanan barang
 * dan keyakinannya di atas SUGGEST_THRESHOLD. `binId` adalah tong untuk kelas itu (null bila tidak
 * punya tong), tanpa melihat keyakinan. Melempar galat bila model atau foto gagal diproses.
 */
export async function guessWasteItem(photo: Blob): Promise<Omit<MlSuggestion, "accepted">> {
  const model = await loadModel();
  const input = await toInput(model, photo);
  const start = performance.now();
  const output = await model.session.run({ [model.session.inputNames[0]]: input });
  const inferMs = performance.now() - start;
  const logits = output[model.session.outputNames[0]].data as Float32Array;

  let best = 0;
  for (let i = 1; i < logits.length; i++) if (logits[i] > logits[best]) best = i;
  let sum = 0;
  for (const value of logits) sum += Math.exp(value - logits[best]);
  const confidence = 1 / sum;

  const classId = model.labels.classes[best] ?? "tidak-dikenal";
  const itemId = CLASS_TO_ITEM[classId] ?? null;
  const bin = model.labels.bin_of?.[classId];
  const binId: BinCategory | null = isBinCategory(bin) ? bin : null;
  return {
    classId,
    confidence: Math.round(confidence * 1000) / 1000,
    itemId,
    binId,
    suggested: itemId !== null && confidence >= SUGGEST_THRESHOLD,
    modelVersion: ML_MODEL_VERSION,
    loadMs: Math.round(model.loadMs),
    inferMs: Math.round(inferMs),
  };
}
