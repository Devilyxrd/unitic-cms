import type { ApiListResponse } from "@/shared/types/core";

export function normalizeListResponse<T>(
  response: T[] | ApiListResponse<T> | null | undefined,
): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}
