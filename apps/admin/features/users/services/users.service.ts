import { apiClient } from "@/shared/lib/apiClient";
import { normalizeListResponse } from "@/shared/utils/normalizeListResponse";
import type { ApiListResponse } from "@/shared/types/core";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@/features/users/types/user.types";

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

export async function setUserActive(
  userId: string,
  active: boolean,
  token: string | null,
) {
  return apiClient<User>(`/users/${userId}/active`, {
    token: token ?? undefined,
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
  token: string | null,
) {
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
