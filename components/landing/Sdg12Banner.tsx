export function Sdg12Banner() {
  return (
    <section className="bg-mint text-forest" aria-labelledby="judul-sdg">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-12 sm:px-6 md:grid-cols-[auto_1fr] md:gap-14 md:py-16">
        <p
          aria-hidden="true"
          className="font-display text-[7rem] font-extrabold leading-none text-forest sm:text-[9rem] md:text-[11rem]"
        >
          12
        </p>
        <div className="max-w-2xl">
          <h2 id="judul-sdg" className="text-2xl font-bold sm:text-3xl">
            SDG 12: Konsumsi dan Produksi yang Bertanggung Jawab
          </h2>
          <p className="mt-4 text-base leading-relaxed sm:text-lg">
            Tujuan ke-12 dari Tujuan Pembangunan Berkelanjutan mengajak kita menghasilkan lebih sedikit sampah
            lewat pencegahan, pengurangan, daur ulang, dan penggunaan kembali.
          </p>
          <p className="mt-3 text-base leading-relaxed sm:text-lg">
            Di kampus, langkah pertamanya sederhana: sampah yang dipilah sejak dari tong bisa dikomposkan atau
            didaur ulang, bukan menumpuk jadi satu.
          </p>
          <a
            href="https://sdgs.un.org/goals/goal12"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:text-leaf-deep"
          >
            Baca target resmi SDG 12 (sdgs.un.org)
            <span className="sr-only"> (membuka tab baru)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
