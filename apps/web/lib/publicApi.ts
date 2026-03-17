export type FieldType =
  | "TEXT"
  | "RICHTEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "MEDIA";

export type PublicField = {
  id: string;
  name: string;
  slug: string;
  type: FieldType;
  required: boolean;
  order: number;
};

export type PublicMedia = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
};

export type PublicEntryValue = {
  id: string;
  value: unknown;
  fieldId: string;
  mediaId?: string | null;
  field: PublicField;
  media?: PublicMedia | null;
};

export type PublicEntry = {
  id: string;
  slug: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  values: PublicEntryValue[];
};

export type PublicListResponse<T> = {
  data: T[];
  total: number;
};

export type PublicContentTypeSummary = {
  id: string;
  name: string;
  slug: string;
  totalPublishedEntries: number;
};

export type PublicAllPublishedGroup = {
  contentType: {
    id: string;
    name: string;
    slug: string;
  };
  entries: PublicEntry[];
  totalPublishedEntries: number;
};

export type PublicAllPublishedResponse = {
  data: PublicAllPublishedGroup[];
  totalContentTypes: number;
  totalEntries: number;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

function resolveMediaUrls(entry: PublicEntry): PublicEntry {
  return {
    ...entry,
    values: entry.values.map((v) =>
      v.media && v.media.url.startsWith("/")
        ? { ...v, media: { ...v.media, url: `${API_BASE}${v.media.url}` } }
        : v,
    ),
  };
}

export async function fetchPublicContentTypes() {
  const response = await fetch(`${API_BASE}/api/public`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return { data: [], total: 0 } satisfies PublicListResponse<PublicContentTypeSummary>;
  }

  return (await response.json()) as PublicListResponse<PublicContentTypeSummary>;
}

export async function fetchPublicAllPublished() {
  const response = await fetch(`${API_BASE}/api/public/all`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return {
      data: [],
      totalContentTypes: 0,
      totalEntries: 0,
    } satisfies PublicAllPublishedResponse;
  }

  const result = (await response.json()) as PublicAllPublishedResponse;
  return {
    ...result,
    data: result.data.map((group) => ({
      ...group,
      entries: group.entries.map(resolveMediaUrls),
    })),
  };
}

export async function fetchPublicEntries(contentType: string) {
  const response = await fetch(`${API_BASE}/api/public/${encodeURIComponent(contentType)}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return { data: [], total: 0 } satisfies PublicListResponse<PublicEntry>;
  }

  const result = (await response.json()) as PublicListResponse<PublicEntry>;
  return { ...result, data: result.data.map(resolveMediaUrls) };
}

export async function fetchPublicEntry(contentType: string, slug: string) {
  const response = await fetch(
    `${API_BASE}/api/public/${encodeURIComponent(contentType)}/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("İçerik alınamadı.");
  }

  return resolveMediaUrls((await response.json()) as PublicEntry);
}
