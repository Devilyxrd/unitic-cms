import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <section className="glass-card fade-up relative overflow-hidden p-7 md:p-10">
        <div
          className="pointer-events-none absolute -top-18 -right-14 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25),transparent_68%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-18 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_70%)]"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col items-start gap-5">
          <span className="pill">Hata 404</span>
          <h1 className="hero-title max-w-[14ch] text-blue-50">Aradığın içerik burada değil.</h1>
          <p className="max-w-[58ch] text-[0.98rem] leading-7 text-slate-300">
            Bu içerik silinmiş, yayından kaldırılmış veya URL yanlış yazılmış olabilir. Public API tarafında kayıt yoksa bu sayfa gösterilir.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-[rgba(56,189,248,0.36)] bg-[rgba(56,189,248,0.12)] px-4 py-2 text-sm font-semibold text-[#d9f3ff] transition hover:bg-[rgba(56,189,248,0.2)]"
            >
              Ana sayfaya dön
            </Link>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api/public/all`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-[rgba(95,111,148,0.4)] bg-[rgba(18,26,43,0.6)] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[rgba(138,174,230,0.52)] hover:text-white"
            >
              API çıktısını kontrol et
            </a>
          </div>
        </div>
      </section>

      <section className="api-note fade-up fade-up-delay-1 mt-6 p-5 text-sm text-slate-300">
        <p className="font-semibold uppercase tracking-[0.08em] text-slate-200">Ne yapabilirsin?</p>
        <p className="mt-2">İçeriği admin panelde tekrar PUBLISHED yap, ardından bu URL&apos;yi yenile.</p>
        <p className="mt-1 text-slate-400">Silinmiş kayıtlar web tarafında artık cache beklemeden anlık olarak 404 döner.</p>
      </section>
    </div>
  );
}
