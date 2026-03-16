import { EntriesPageClient } from "@/features/entries/components/entries-page-client";

type EntriesPageProps = {
  params: Promise<{ contentType: string }>;
};

export default async function EntriesPage({ params }: EntriesPageProps) {
  const { contentType } = await params;
  return <EntriesPageClient contentType={contentType} />;
}
