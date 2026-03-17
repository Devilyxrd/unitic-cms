import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchPublicEntry } from "@/lib/publicApi";

type Props = {
  params: Promise<{ contentType: string; slug: string }>;
};

function formatValue(fieldType: string, value: unknown) {
  if (fieldType === "BOOLEAN") {
    return value ? "Evet" : "Hayır";
  }

  if (fieldType === "DATE" && typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("tr-TR", { dateStyle: "medium" });
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("tr-TR").format(value);
  }

  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "-";
  }

  return JSON.stringify(value);
}

export default async function ContentPage({ params }: Props) {
  const resolvedParams = await params;
  const entry = await fetchPublicEntry(resolvedParams.contentType, resolvedParams.slug);

  if (!entry) {
    notFound();
  }

  return (
    <div className="page-shell">
      <header className="glass-card fade-up flex flex-col gap-5 p-7 md:p-9">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="pill">{resolvedParams.contentType}</span>
          <span>{entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString("tr-TR", { dateStyle: "medium" }) : "Yayın tarihi yok"}</span>
        </div>
        <h1 className="hero-title text-blue-50">{entry.slug ?? entry.id}</h1>
        <p className="text-sm text-slate-300">Bu içerik public API üzerinden okunur ve yalnızca yayınlanan verileri içerir.</p>
      </header>

      <section className="mt-8 grid gap-5">
        {entry.values.length === 0 ? (
          <div className="glass-card px-6 py-5 text-sm text-slate-300">Bu içerikte henüz veri bulunmuyor.</div>
        ) : (
          entry.values.map((item) => (
            <article key={item.id} className="glass-card entry-card fade-up fade-up-delay-1 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
                  {item.field.name}
                </h2>
                <span className="text-xs text-slate-400">{item.field.type}</span>
              </div>

              {item.field.type === "MEDIA" && item.media ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-(--line) bg-(--surface-alt)">
                  {item.media.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.media.url} alt={item.media.filename} className="h-72 w-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-200">
                      <span>{item.media.filename}</span>
                      <a className="text-emerald-300 hover:text-emerald-200" href={item.media.url}>
                        İndir
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 whitespace-pre-wrap text-base text-slate-200">
                  {formatValue(item.field.type, item.value)}
                </p>
              )}
            </article>
          ))
        )}
      </section>

      <aside className="api-note mt-8 p-4 text-xs text-slate-300">
        <p className="font-semibold uppercase tracking-[0.08em] text-slate-200">Public API Dipnotu</p>
        <p className="mt-2">Bu detay ekranı şu endpoint ile beslenir:</p>
        <p className="mt-1">GET /api/public/{resolvedParams.contentType}/{resolvedParams.slug}</p>
      </aside>

      <div className="mt-10">
        <Link href="/" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          ← Tüm içeriklere dön
        </Link>
      </div>
    </div>
  );
}
