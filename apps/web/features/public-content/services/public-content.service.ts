import type {
  PublicAllPublishedResponse,
  PublicContentTypeSummary,
  PublicEntry,
  PublicListResponse,
} from "@/features/public-content/types/public-content.types";

const PUBLIC_API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

// On Node runtime, localhost can be noticeably slower due to IPv6/IPv4 fallback.
const FETCH_API_BASE =
  typeof window === "undefined"
    ? PUBLIC_API_BASE.replace("://localhost", "://127.0.0.1")
    : PUBLIC_API_BASE;

const LIVE_FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

function resolveMediaUrls(entry: PublicEntry): PublicEntry {
  return {
    ...entry,
    values: entry.values.map((value) =>
      value.media && value.media.url.startsWith("/")
        ? { ...value, media: { ...value.media, url: `${PUBLIC_API_BASE}${value.media.url}` } }
        : value,
    ),
  };
}

export async function fetchPublicContentTypes() {
  const response = await fetch(`${FETCH_API_BASE}/api/public`, LIVE_FETCH_OPTIONS);

  if (!response.ok) {
    return { data: [], total: 0 } satisfies PublicListResponse<PublicContentTypeSummary>;
  }

  return (await response.json()) as PublicListResponse<PublicContentTypeSummary>;
}

export async function fetchPublicAllPublished() {
  const response = await fetch(`${FETCH_API_BASE}/api/public/all`, LIVE_FETCH_OPTIONS);

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
  const response = await fetch(
    `${FETCH_API_BASE}/api/public/${encodeURIComponent(contentType)}`,
    LIVE_FETCH_OPTIONS,
  );

  if (!response.ok) {
    return { data: [], total: 0 } satisfies PublicListResponse<PublicEntry>;
  }

  const result = (await response.json()) as PublicListResponse<PublicEntry>;
  return { ...result, data: result.data.map(resolveMediaUrls) };
}

export async function fetchPublicEntry(contentType: string, slug: string) {
  const response = await fetch(
    `${FETCH_API_BASE}/api/public/${encodeURIComponent(contentType)}/${encodeURIComponent(slug)}`,
    LIVE_FETCH_OPTIONS,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Icerik alinamadi.");
  }

  return resolveMediaUrls((await response.json()) as PublicEntry);
}
