import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // File di public/ dikirim dengan max-age=0. Model pengenal sampah besar (sekitar 17 MB) dan namanya
  // memuat versi (sampah-v2), jadi aman di-cache lama. Ganti nama berkas setiap model diperbarui.
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    // Export bawaan onnxruntime-web/wasm adalah varian "bundle" yang ikut memaketkan berkas WASM 15 MB
    // ke build. Varian eksternal memuat WASM dari env.wasm.wasmPaths (jsDelivr, lihat lib/ml/classify.ts).
    resolveAlias: {
      "onnxruntime-web/wasm": "./node_modules/onnxruntime-web/dist/ort.wasm.min.mjs",
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
