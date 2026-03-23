import Link from "next/link";

import type { PublicEntry } from "@/features/public-content/types/public-content.types";
import {
  formatPublishedDate,
  getEntryExcerpt,
  getEntryTitle,
} from "@/features/public-content/utils/public-content";

type PublicEntryCardProps = {
  contentTypeSlug: string;
  entry: PublicEntry;
};

export function PublicEntryCard({
  contentTypeSlug,
  entry,
}: PublicEntryCardProps) {
  const title = getEntryTitle(entry);
  const href = entry.slug ? `/${contentTypeSlug}/${entry.slug}` : null;

  return (
    <article className="glass-card entry-card fade-up fade-up-delay-2 flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="pill">{contentTypeSlug}</span>
        <span>{formatPublishedDate(entry.publishedAt)}</span>
      </div>

      <h3 className="text-lg font-semibold text-blue-50">{title}</h3>
      <p className="text-sm text-slate-300">{getEntryExcerpt(entry)}</p>

      {href ? (
        <Link
          href={href}
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
        >
          Icerigi oku
          <span aria-hidden>→</span>
        </Link>
      ) : (
        <p className="mt-auto text-xs text-slate-400">Bu icerik icin slug bulunmuyor.</p>
      )}
    </article>
  );
}
