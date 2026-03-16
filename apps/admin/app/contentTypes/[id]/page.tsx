import { ContentTypeDetailClient } from "@/features/contentTypes/components/contentTypeDetailClient";

type ContentTypeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentTypeDetailPage({ params }: ContentTypeDetailPageProps) {
  const { id } = await params;
  return <ContentTypeDetailClient id={id} />;
}
