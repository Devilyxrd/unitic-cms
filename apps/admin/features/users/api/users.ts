import { apiClient } from "@/shared/lib/api-client";
import type { ApiListResponse, Role, User } from "@/types";

export type CreateUserPayload = {
  email: string;
  username: string;
  password: string;
  role: Role;
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

export async function listUsers(token: string | null) {
  const response = await apiClient<User[] | ApiListResponse<User> | null>("/users", {
    token: token ?? undefined,
    method: "GET",
  });
  return normalizeListResponse(response);
}

export async function createUser(payload: CreateUserPayload, token: string | null) {
  return apiClient<User>("/users", {
    token: token ?? undefined,
    method: "POST",
    body: JSON.stringify(payload),
  });
}
