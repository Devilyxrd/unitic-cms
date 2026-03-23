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

export async function listContentTypes() {
  const response = await apiClient<ContentType[] | ApiListResponse<ContentType> | null>(
    "/content-types",
    {
      method: "GET",
    },
  );

  return normalizeListResponse(response);
}

export async function getContentTypeById(id: string) {
  return apiClient<ContentType>(`/content-types/${id}`, {
    method: "GET",
  });
}

export async function createContentType(
  payload: CreateContentTypePayload,
) {
  return apiClient<ContentType>("/content-types", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateContentType(
  id: string,
  payload: UpdateContentTypePayload,
) {
  return apiClient<ContentType>(`/content-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteContentType(id: string) {
  return apiClient<{ success: boolean }>(`/content-types/${id}`, {
    method: "DELETE",
  });
}

export async function addContentField(
  contentTypeId: string,
  payload: CreateContentFieldPayload,
) {
  return apiClient<ContentType>(`/content-types/${contentTypeId}/fields`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateContentField(
  contentTypeId: string,
  fieldId: string,
  payload: UpdateContentFieldPayload,
) {
  return apiClient<ContentType>(
    `/content-types/${contentTypeId}/fields/${fieldId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteContentField(
  contentTypeId: string,
  fieldId: string,
) {
  return apiClient<ContentType>(
    `/content-types/${contentTypeId}/fields/${fieldId}`,
    {
      method: "DELETE",
    },
  );
}

export type { FieldType };
