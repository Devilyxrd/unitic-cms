import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchPublicEntry } from "@/lib/publicApi";

export const dynamic = "force-dynamic";

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

function normalizeForMatch(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

export default async function ContentPage({ params }: Props) {
  const resolvedParams = await params;
  const entry = await fetchPublicEntry(resolvedParams.contentType, resolvedParams.slug);

  if (!entry) {
    notFound();
  }

  const sortedValues = [...entry.values].sort((a, b) => a.field.order - b.field.order);
  const titleCandidates = ["title", "baslik", "basligi", "heading", "headline"];
  const titleFieldValue = sortedValues.find(
    (item) => {
      if (typeof item.value !== "string" || item.value.trim().length === 0) {
        return false;
      }

      const normalizedSlug = normalizeForMatch(item.field.slug);
      const normalizedName = normalizeForMatch(item.field.name);

      return titleCandidates.some(
        (candidate) =>
          normalizedSlug === candidate ||
          normalizedSlug.includes(candidate) ||
          normalizedName.includes(candidate),
      );
    },
  );
  const firstTextValue = sortedValues.find(
    (item) =>
      (item.field.type === "TEXT" || item.field.type === "RICHTEXT") &&
      typeof item.value === "string" &&
      item.value.trim().length > 0,
  );
  const pageTitle =
    typeof titleFieldValue?.value === "string" && titleFieldValue.value.trim().length > 0
      ? titleFieldValue.value
      : typeof firstTextValue?.value === "string" && firstTextValue.value.trim().length > 0
        ? firstTextValue.value
        : "İçerik Detayı";
  const leadImage = sortedValues.find(
    (item) => item.field.type === "MEDIA" && item.media?.mimeType.startsWith("image/"),
  )?.media;
  const textBlocks = sortedValues.filter(
    (item) =>
      item.id !== titleFieldValue?.id &&
      (item.field.type === "TEXT" || item.field.type === "RICHTEXT") &&
      typeof item.value === "string" &&
      item.value.trim().length > 0,
  );
  const fallbackBlocks = sortedValues.filter(
    (item) => item.field.type !== "MEDIA" && item.field.type !== "TEXT" && item.field.type !== "RICHTEXT",
  );

  return (
    <div className="page-shell">
      <div className="mb-5">
        <Link href="/" className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
          ← Tüm içeriklere dön
        </Link>
      </div>

      <header className="glass-card fade-up flex flex-col gap-5 p-7 md:p-9">
        <h1 className="text-[clamp(1.75rem,1.4rem+1.7vw,2.55rem)] leading-tight font-semibold tracking-[-0.02em] text-blue-50">
          {pageTitle}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="pill">{resolvedParams.contentType}</span>
          <span>{entry.publishedAt ? new Date(entry.publishedAt).toLocaleDateString("tr-TR", { dateStyle: "medium" }) : "Yayın tarihi yok"}</span>
        </div>
      </header>

      <article className="glass-card fade-up fade-up-delay-1 mt-8 p-6 md:p-8">
        {textBlocks.length === 0 && fallbackBlocks.length === 0 && !leadImage ? (
          <p className="text-sm text-slate-300">Bu içerikte henüz veri bulunmuyor.</p>
        ) : (
          <>
            {leadImage ? (
              <figure className="mb-5 w-full overflow-hidden rounded-xl border border-(--line) bg-(--surface-alt) md:float-right md:mb-4 md:ml-7 md:w-[38%] lg:w-[34%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={leadImage.url} alt={leadImage.filename} className="h-full w-full object-cover" />
              </figure>
            ) : null}

            <div className="space-y-5 text-[1.02rem] leading-8 text-slate-100">
              {textBlocks.map((item) => (
                <p key={item.id} className="whitespace-pre-wrap">
                  {item.value as string}
                </p>
              ))}

              {textBlocks.length === 0
                ? fallbackBlocks.map((item) => (
                    <p key={item.id} className="whitespace-pre-wrap">
                      {formatValue(item.field.type, item.value)}
                    </p>
                  ))
                : null}
            </div>

            <div className="clear-both" />
          </>
        )}
      </article>
    </div>
  );
}
