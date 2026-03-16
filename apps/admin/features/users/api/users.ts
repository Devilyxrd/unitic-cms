import { apiClient } from "@/shared/lib/api-client";
import type { ApiListResponse, Role, User } from "@/types";

export type CreateUserPayload = {
  email: string;
  username: string;
  password: string;
  role: Role;
};

export type UpdateUserPayload = {
  email?: string;
  username?: string;
  password?: string;
  role?: Role;
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

export async function setUserActive(userId: string, active: boolean, token: string | null) {
  return apiClient<User>(`/users/${userId}/active`, {
    token: token ?? undefined,
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function updateUser(userId: string, payload: UpdateUserPayload, token: string | null) {
  return apiClient<User>(`/users/${userId}`, {
    token: token ?? undefined,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: string, token: string | null) {
  return apiClient<{ success: boolean }>(`/users/${userId}`, {
    token: token ?? undefined,
    method: "DELETE",
  });
}
