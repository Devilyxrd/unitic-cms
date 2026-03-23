import { apiClient } from "@/shared/lib/apiClient";
import { normalizeListResponse } from "@/shared/utils/normalizeListResponse";
import type { ApiListResponse, FieldType } from "@/shared/types/core";
import type {
  ContentType,
  CreateContentFieldPayload,
  CreateContentTypePayload,
  UpdateContentFieldPayload,
  UpdateContentTypePayload,
} from "@/features/contentTypes/types/content-type.types";

export async function listContentTypes(token: string | null) {
  const response = await apiClient<ContentType[] | ApiListResponse<ContentType> | null>(
    "/content-types",
    {
      token: token ?? undefined,
      method: "GET",
    },
  );

  return normalizeListResponse(response);
}

export async function getContentTypeById(id: string, token: string | null) {
  return apiClient<ContentType>(`/content-types/${id}`, {
    token: token ?? undefined,
    method: "GET",
  });
}

export async function createContentType(
  payload: CreateContentTypePayload,
  token: string | null,
) {
  return apiClient<ContentType>("/content-types", {
    token: token ?? undefined,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateContentType(
  id: string,
  payload: UpdateContentTypePayload,
  token: string | null,
) {
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
  payload: CreateContentFieldPayload,
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
  return apiClient<ContentType>(
    `/content-types/${contentTypeId}/fields/${fieldId}`,
    {
      token: token ?? undefined,
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteContentField(
  contentTypeId: string,
  fieldId: string,
  token: string | null,
) {
  return apiClient<ContentType>(
    `/content-types/${contentTypeId}/fields/${fieldId}`,
    {
      token: token ?? undefined,
      method: "DELETE",
    },
  );
}

export type { FieldType };
