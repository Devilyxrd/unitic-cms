import Link from "next/link";

import { HomeScrollController } from "@/components/homeScrollController";
import { fetchPublicAllPublished, type PublicEntry } from "@/lib/publicApi";

function getEntryTitle(entry: PublicEntry) {
  const titleLike = entry.values.find(
    (item) =>
      item.field.slug.toLowerCase() === "title" ||
      item.field.name.toLowerCase().includes("başlık") ||
      item.field.name.toLowerCase().includes("title"),
  );

  if (typeof titleLike?.value === "string" && titleLike.value.trim()) {
    return titleLike.value;
  }

  const firstText = entry.values.find(
    (item) => item.field.type === "TEXT" || item.field.type === "RICHTEXT",
  );

  if (typeof firstText?.value === "string" && firstText.value.trim()) {
    return firstText.value;
  }

  return entry.slug ?? entry.id;
}

function getEntryExcerpt(entry: PublicEntry) {
  const rich = entry.values.find((item) => item.field.type === "RICHTEXT");
  const text = entry.values.find((item) => item.field.type === "TEXT");
  const raw = (typeof rich?.value === "string" ? rich.value : null) ?? (typeof text?.value === "string" ? text.value : "");
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Bu içerik için kısa açıklama bulunamadı.";
  return cleaned.length > 160 ? `${cleaned.slice(0, 160)}…` : cleaned;
}

function formatDate(value?: string | null) {
  if (!value) return "Yayın tarihi yok";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Yayın tarihi yok" : date.toLocaleDateString("tr-TR", { dateStyle: "medium" });
}

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
          <div key={group.contentType.id} className="fade-up fade-up-delay-1 space-y-4">
            <div>
              <h2 className="section-title">{group.contentType.name}</h2>
              <p className="section-subtitle">
                <span className="font-semibold text-slate-300">{group.contentType.slug}</span> için toplam {group.totalPublishedEntries} yayın listeleniyor.
              </p>
            </div>

            {group.entries.length === 0 ? (
              <div className="glass-card px-6 py-5 text-sm text-slate-300">
                Henüz yayınlanmış içerik bulunamadı.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {group.entries.map((entry) => {
                  const title = getEntryTitle(entry);
                  const href = entry.slug ? `/${group.contentType.slug}/${entry.slug}` : null;

                  return (
                    <article key={entry.id} className="glass-card entry-card fade-up fade-up-delay-2 flex h-full flex-col gap-4 p-6">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="pill">{group.contentType.slug}</span>
                        <span>{formatDate(entry.publishedAt)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-blue-50">{title}</h3>
                      <p className="text-sm text-slate-300">{getEntryExcerpt(entry)}</p>
                      {href ? (
                        <Link
                          href={href}
                          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                        >
                          İçeriği oku
                          <span aria-hidden>→</span>
                        </Link>
                      ) : (
                        <p className="mt-auto text-xs text-slate-400">Bu içerik için slug bulunmuyor.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
