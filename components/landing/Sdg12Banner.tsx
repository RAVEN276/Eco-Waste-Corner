// Dua bidang: label SDG di blok ink, penjelasan di blok terang. Tautan sumber resmi di bawahnya.
export function Sdg12Banner() {
  return (
    <section className="border-b-2 border-line" aria-labelledby="judul-sdg">
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal-l bg-cobalt px-4 py-12 text-white sm:px-6 md:px-10 md:py-16 md:pl-[max(1.5rem,calc((100vw_-_72rem)/2_+_1.5rem))]">
          <p className="font-display text-3xl font-extrabold text-mist">Konteks global</p>
          <h2 id="judul-sdg" className="mt-3 max-w-md text-5xl sm:text-6xl">
            SDG 12: konsumsi dan produksi yang bertanggung jawab
          </h2>
        </div>
        <div className="reveal-r bg-paper px-4 py-12 sm:px-6 md:px-10 md:py-16 md:pr-[max(1.5rem,calc((100vw_-_72rem)/2_+_1.5rem))]">
          <div className="max-w-xl">
            <p className="text-lg leading-relaxed">
              Tujuan ke-12 dari Tujuan Pembangunan Berkelanjutan mengajak kita menghasilkan lebih
              sedikit sampah lewat pencegahan, pengurangan, daur ulang, dan penggunaan kembali.
            </p>
            <p className="mt-3 text-lg leading-relaxed">
              Di kampus, langkah pertamanya sederhana: sampah yang dipilah sejak dari tong bisa
              dikomposkan atau didaur ulang, bukan menumpuk jadi satu.
            </p>
            <a
              href="https://sdgs.un.org/goals/goal12"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center font-bold text-link underline decoration-2 underline-offset-4 hover:text-cobalt-deep"
            >
              Baca target resmi SDG 12 (sdgs.un.org)
              <span className="sr-only"> (membuka tab baru)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
