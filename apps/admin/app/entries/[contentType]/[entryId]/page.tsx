import { EntryDetailClient } from "@/features/entries/components/entry-detail-client";

type EntryDetailPageProps = {
  params: Promise<{ contentType: string; entryId: string }>;
};

export default async function EntryDetailPage({ params }: EntryDetailPageProps) {
  const { contentType, entryId } = await params;
  return <EntryDetailClient contentType={contentType} entryId={entryId} />;
}
