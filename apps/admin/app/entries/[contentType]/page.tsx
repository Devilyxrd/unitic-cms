type EntriesPageProps = {
  params: Promise<{ contentType: string }>;
};

export default async function EntriesPage({ params }: EntriesPageProps) {
  const { contentType } = await params;

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Records</p>
      <h1 className="page-title">Entries</h1>
      <p className="page-subtitle">Listing entries for content type: {contentType}</p>
    </section>
  );
}
