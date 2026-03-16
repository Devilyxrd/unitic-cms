import { apiClient } from "@/shared/lib/apiClient";
import type { ApiListResponse, MediaItem } from "@/types";

function normalizeListResponse<T>(response: T[] | ApiListResponse<T> | null | undefined): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

export async function listMedia(token: string | null) {
  const response = await apiClient<MediaItem[] | ApiListResponse<MediaItem> | null>("/media", {
    token: token ?? undefined,
    method: "GET",
  });
  return normalizeListResponse(response);
}

export async function uploadMedia(file: File, token: string | null) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/media`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Medya yükleme başarısız.");
  }

  return (await response.json()) as MediaItem;
}

export async function deleteMedia(id: string, token: string | null) {
  return apiClient<{ success: boolean }>(`/media/${id}`, {
    token: token ?? undefined,
    method: "DELETE",
  });
}
