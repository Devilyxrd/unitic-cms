import { HomeScrollController } from "@/features/public-content/components/home-scroll-controller";
import { PublicContentGroupSection } from "@/features/public-content/components/public-content-group-section";
import { fetchPublicAllPublished } from "@/features/public-content/services/public-content.service";

export default async function HomePage() {
  const allPublished = await fetchPublicAllPublished();
  const results = allPublished.data;
  const totalEntries = allPublished.totalEntries;

  return (
    <div className="page-shell">
      <HomeScrollController />

      <header className="glass-card fade-up flex flex-col gap-7 p-7 md:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="pill">Unitic CMS Public</span>
            <h1 className="hero-title mt-4 text-blue-50">
              Yayınlanan içerikler tek merkezde, sade ve hızlı.
            </h1>
            <p className="hero-subtitle">
              İçerik tiplerine göre ayrılmış tüm yayınları buradan takip edebilirsin. Sayfa doğrudan public API ile beslenir ve yeni yayınlar otomatik görünür.
            </p>
          </div>
          <div className="api-note w-full max-w-sm p-4 text-xs text-slate-300">
            <p className="font-semibold uppercase tracking-[0.08em] text-slate-200">Public API Dipnotu</p>
            <p className="mt-2">Bu arayüz yalnızca yayınlanan içerikleri çeker.</p>
            <p className="mt-1">GET /api/public/all</p>
            <p className="mt-1">GET /api/public/:contentType</p>
            <p>GET /api/public/:contentType/:slug</p>
            <p className="mt-2 text-slate-400">Toplam {allPublished.totalContentTypes} tipte {allPublished.totalEntries} yayın listeleniyor.</p>
          </div>
        </div>
      </header>

      {totalEntries === 0 ? (
        <div className="api-note mt-6 p-4 text-xs text-slate-300">
          <p className="font-semibold uppercase tracking-[0.08em] text-slate-200">İçerik Bulunamadı</p>
          <p className="mt-2">Public API tarafında yayınlanmış kayıt bulunamadı.</p>
          <p className="mt-2 text-slate-400">İpucu: Admin panelde en az bir kaydı PUBLISHED yap ve tekrar kontrol et.</p>
        </div>
      ) : null}

      <section id="content-grid" className="mt-10 grid gap-10 scroll-mt-28">
        {results.map((group) => (
          <PublicContentGroupSection key={group.contentType.id} group={group} />
        ))}
      </section>
    </div>
  );
}
