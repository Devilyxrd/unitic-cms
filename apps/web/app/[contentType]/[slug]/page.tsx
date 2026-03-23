import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchPublicEntry } from "@/features/public-content/services/public-content.service";
import {
  formatFieldValue,
  formatPublishedDate,
  getEntryDetailView,
} from "@/features/public-content/utils/public-content";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ contentType: string; slug: string }>;
};

export default async function ContentPage({ params }: Props) {
  const resolvedParams = await params;
  const entry = await fetchPublicEntry(resolvedParams.contentType, resolvedParams.slug);

  if (!entry) {
    notFound();
  }

  const { fallbackBlocks, leadImage, pageTitle, textBlocks } = getEntryDetailView(entry);

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
          <span>{formatPublishedDate(entry.publishedAt)}</span>
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
                      {formatFieldValue(item.field.type, item.value)}
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
