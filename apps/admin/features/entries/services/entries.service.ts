import { apiClient } from "@/shared/lib/apiClient";
import { normalizeListResponse } from "@/shared/utils/normalizeListResponse";
import type { ApiListResponse, EntryStatus } from "@/shared/types/core";
import type {
  CreateEntryPayload,
  Entry,
  UpdateEntryPayload,
} from "@/features/entries/types/entry.types";

export async function listEntries(
  params: { contentTypeSlug: string; status?: EntryStatus },
) {
  const path = params.status
    ? `/entries/content-type/${encodeURIComponent(
        params.contentTypeSlug,
      )}/status/${encodeURIComponent(params.status)}`
    : `/entries/content-type/${encodeURIComponent(params.contentTypeSlug)}`;

  const response = await apiClient<Entry[] | ApiListResponse<Entry> | null>(path, {
    method: "GET",
  });

  return normalizeListResponse(response);
}

export async function getEntryById(entryId: string) {
  return apiClient<Entry>(`/entries/${entryId}`, {
    method: "GET",
  });
}

export async function createEntry(
  contentTypeSlug: string,
  payload: CreateEntryPayload,
) {
  return apiClient<Entry>(`/entries/content-type/${encodeURIComponent(contentTypeSlug)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEntryStatus(
  entryId: string,
  status: EntryStatus,
) {
  return apiClient<Entry>(`/entries/${entryId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteEntry(entryId: string) {
  return apiClient<{ success: boolean }>(`/entries/${entryId}`, {
    method: "DELETE",
  });
}

export async function updateEntry(
  entryId: string,
  payload: UpdateEntryPayload,
) {
  return apiClient<Entry>(`/entries/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type { EntryStatus };
