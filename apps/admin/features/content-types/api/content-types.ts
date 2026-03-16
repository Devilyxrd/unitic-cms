import { apiClient } from "@/shared/lib/api-client";
import type { ApiListResponse, ContentType } from "@/types";

export type CreateContentTypePayload = {
  name: string;
  slug: string;
  description?: string;
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

export async function listContentTypes(token: string | null) {
  const response = await apiClient<ContentType[] | ApiListResponse<ContentType> | null>("/content-types", {
    token: token ?? undefined,
    method: "GET",
  });
  return normalizeListResponse(response);
}

export async function getContentTypeById(id: string, token: string | null) {
  return apiClient<ContentType>(`/content-types/${id}`, { token: token ?? undefined, method: "GET" });
}

export async function createContentType(payload: CreateContentTypePayload, token: string | null) {
  return apiClient<ContentType>("/content-types", {
    token: token ?? undefined,
    method: "POST",
    body: JSON.stringify(payload),
  });
}
