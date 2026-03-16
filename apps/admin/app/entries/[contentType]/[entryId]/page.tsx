type EntryDetailPageProps = {
  params: Promise<{ contentType: string; entryId: string }>;
};

export default async function EntryDetailPage({ params }: EntryDetailPageProps) {
  const { contentType, entryId } = await params;

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Record Detail</p>
      <h1 className="page-title">Entry Detail</h1>
      <p className="page-subtitle">
        Entry {entryId} in {contentType}
      </p>
    </section>
  );
}
