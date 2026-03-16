import { ContentTypeDetailClient } from "@/features/content-types/components/content-type-detail-client";

type ContentTypeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentTypeDetailPage({ params }: ContentTypeDetailPageProps) {
  const { id } = await params;
  return <ContentTypeDetailClient id={id} />;
}
