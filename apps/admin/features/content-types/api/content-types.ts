import { apiClient } from "@/shared/lib/api-client";
import type { ApiListResponse, ContentType, FieldType } from "@/types";

export type CreateContentTypePayload = {
  name: string;
  slug: string;
  description?: string;
};

export type UpdateContentTypePayload = {
  name?: string;
  slug?: string;
  description?: string;
};

export type UpdateContentFieldPayload = {
  name?: string;
  slug?: string;
  type?: FieldType;
  required?: boolean;
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

export async function updateContentType(id: string, payload: UpdateContentTypePayload, token: string | null) {
  return apiClient<ContentType>(`/content-types/${id}`, {
    token: token ?? undefined,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteContentType(id: string, token: string | null) {
  return apiClient<{ success: boolean }>(`/content-types/${id}`, {
    token: token ?? undefined,
    method: "DELETE",
  });
}

export async function addContentField(
  contentTypeId: string,
  payload: { name: string; slug: string; type: FieldType; required?: boolean },
  token: string | null,
) {
  return apiClient<ContentType>(`/content-types/${contentTypeId}/fields`, {
    token: token ?? undefined,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateContentField(
  contentTypeId: string,
  fieldId: string,
  payload: UpdateContentFieldPayload,
  token: string | null,
) {
  return apiClient<ContentType>(`/content-types/${contentTypeId}/fields/${fieldId}`, {
    token: token ?? undefined,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteContentField(contentTypeId: string, fieldId: string, token: string | null) {
  return apiClient<ContentType>(`/content-types/${contentTypeId}/fields/${fieldId}`, {
    token: token ?? undefined,
    method: "DELETE",
  });
}
