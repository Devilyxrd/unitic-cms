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

const PUBLIC_API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

// On Node runtime, localhost can be noticeably slower due to IPv6/IPv4 fallback.
const FETCH_API_BASE =
  typeof window === "undefined"
    ? PUBLIC_API_BASE.replace("://localhost", "://127.0.0.1")
    : PUBLIC_API_BASE;

function resolveMediaUrls(entry: PublicEntry): PublicEntry {
  return {
    ...entry,
    values: entry.values.map((v) =>
      v.media && v.media.url.startsWith("/")
        ? { ...v, media: { ...v.media, url: `${PUBLIC_API_BASE}${v.media.url}` } }
        : v,
    ),
  };
}

export async function fetchPublicContentTypes() {
  const response = await fetch(`${FETCH_API_BASE}/api/public`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return { data: [], total: 0 } satisfies PublicListResponse<PublicContentTypeSummary>;
  }

  return (await response.json()) as PublicListResponse<PublicContentTypeSummary>;
}

export async function fetchPublicAllPublished() {
  const response = await fetch(`${FETCH_API_BASE}/api/public/all`, {
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
  const response = await fetch(`${FETCH_API_BASE}/api/public/${encodeURIComponent(contentType)}`, {
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
    `${FETCH_API_BASE}/api/public/${encodeURIComponent(contentType)}/${encodeURIComponent(slug)}`,
    { next: { revalidate: 30 } },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("İçerik alınamadı.");
  }

  return resolveMediaUrls((await response.json()) as PublicEntry);
}
