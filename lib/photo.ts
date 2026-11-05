export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Photos live inside a Firestore document, which is capped at 1 MiB. The data
 * URL is kept well below that so the document has room for its other fields.
 */
export const MAX_DATA_URL_LENGTH = 300_000;
const MAX_SIDE_PX = 1024;
const QUALITY_STEPS = [0.72, 0.6, 0.5, 0.4, 0.3];
const SIZE_STEPS = [MAX_SIDE_PX, 800, 640, 480];

export function validatePhoto(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return "Format foto harus JPG, PNG, atau WebP.";
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return `Ukuran foto maksimal ${MAX_PHOTO_BYTES / 1024 / 1024} MB.`;
  }
  if (file.size === 0) {
    return "File foto kosong. Pilih foto lain.";
  }
  return null;
}

/** SHA-256 of the original file bytes, used to detect re-submitted photos. */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Foto tidak bisa dibaca."));
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Foto tidak bisa diproses."))),
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Downscales and re-encodes the photo as JPEG until the data URL fits in
 * `MAX_DATA_URL_LENGTH`. Runs in the browser only.
 */
export async function compressPhoto(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Foto tidak bisa dibuka. Coba foto lain.");
  }

  try {
    for (const maxSide of SIZE_STEPS) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Browser tidak mendukung pemrosesan foto.");
      // JPEG has no alpha, so transparent PNG pixels would turn black without this.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITY_STEPS) {
        const dataUrl = await blobToDataUrl(await canvasToBlob(canvas, quality));
        if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
      }
    }
  } finally {
    bitmap.close();
  }
  throw new Error("Foto terlalu kompleks untuk dikompres. Coba foto lain.");
}
