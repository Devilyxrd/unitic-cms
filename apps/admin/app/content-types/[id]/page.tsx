type ContentTypeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentTypeDetailPage({ params }: ContentTypeDetailPageProps) {
  const { id } = await params;

  return (
    <section className="page-card">
      <h1 className="page-title">Content Type Detail</h1>
      <p className="page-subtitle">Selected content type id: {id}</p>
    </section>
  );
}
