import { apiClient } from "@/shared/lib/apiClient";
import type { ApiListResponse, Entry, EntryStatus } from "@/types";

export type CreateEntryPayload = {
  slug?: string;
  status: EntryStatus;
  values: Array<{ fieldId: string; value?: unknown; mediaId?: string | null }>;
};

export type UpdateEntryPayload = {
  slug?: string;
  status?: EntryStatus;
  values?: Array<{ fieldId: string; value?: unknown; mediaId?: string | null }>;
};

function normalizeListResponse<T>(response: T[] | ApiListResponse<T> | null | undefined): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

export async function listEntries(params: { contentTypeSlug: string; status?: EntryStatus }, token: string | null) {
  const path = params.status
    ? `/entries/content-type/${encodeURIComponent(params.contentTypeSlug)}/status/${encodeURIComponent(params.status)}`
    : `/entries/content-type/${encodeURIComponent(params.contentTypeSlug)}`;
  const response = await apiClient<Entry[] | ApiListResponse<Entry> | null>(path, {
    token: token ?? undefined,
    method: "GET",
  });
  return normalizeListResponse(response);
}

export async function getEntryById(entryId: string, token: string | null) {
  return apiClient<Entry>(`/entries/${entryId}`, { token: token ?? undefined, method: "GET" });
}

export async function createEntry(contentTypeSlug: string, payload: CreateEntryPayload, token: string | null) {
  return apiClient<Entry>(`/entries/content-type/${encodeURIComponent(contentTypeSlug)}`, {
    token: token ?? undefined,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEntryStatus(entryId: string, status: EntryStatus, token: string | null) {
  return apiClient<Entry>(`/entries/${entryId}/status`, {
    token: token ?? undefined,
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteEntry(entryId: string, token: string | null) {
  return apiClient<{ success: boolean }>(`/entries/${entryId}`, {
    token: token ?? undefined,
    method: "DELETE",
  });
}

export async function updateEntry(entryId: string, payload: UpdateEntryPayload, token: string | null) {
  return apiClient<Entry>(`/entries/${entryId}`, {
    token: token ?? undefined,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
