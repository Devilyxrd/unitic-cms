import { apiClient } from "@/shared/lib/apiClient";
import type { ApiListResponse, MediaItem } from "@/types";

export const MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
]);

export function validateMediaFile(file: File): string | null {
  if (!file || !(file instanceof File)) {
    return "Geçerli bir dosya seçilmelidir.";
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return "Dosya boyutu geçersiz.";
  }

  if (file.size > MAX_MEDIA_FILE_SIZE) {
    return "Dosya boyutu 10 MB sınırını aşamaz.";
  }

  if (!file.type || !file.type.includes("/")) {
    return "Dosya türü geçersiz.";
  }

  if (!ALLOWED_MEDIA_MIME_TYPES.has(file.type)) {
    return "Bu dosya türü desteklenmiyor.";
  }

  return null;
}

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
  const validationError = validateMediaFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

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
