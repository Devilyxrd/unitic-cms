import type { PublicAllPublishedGroup } from "@/features/public-content/types/public-content.types";
import { PublicEntryCard } from "@/features/public-content/components/public-entry-card";

type PublicContentGroupSectionProps = {
  group: PublicAllPublishedGroup;
};

export function PublicContentGroupSection({
  group,
}: PublicContentGroupSectionProps) {
  return (
    <div className="fade-up fade-up-delay-1 space-y-4">
      <div>
        <h2 className="section-title">{group.contentType.name}</h2>
        <p className="section-subtitle">
          <span className="font-semibold text-slate-300">{group.contentType.slug}</span> icin toplam{" "}
          {group.totalPublishedEntries} yayin listeleniyor.
        </p>
      </div>

      {group.entries.length === 0 ? (
        <div className="glass-card px-6 py-5 text-sm text-slate-300">
          Henuz yayinlanmis icerik bulunamadi.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {group.entries.map((entry) => (
            <PublicEntryCard
              key={entry.id}
              contentTypeSlug={group.contentType.slug}
              entry={entry}
            />
          ))}
        </div>
      )}
    </div>
  );
}
