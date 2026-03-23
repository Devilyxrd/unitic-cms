import { apiClient } from "@/shared/lib/apiClient";
import { normalizeListResponse } from "@/shared/utils/normalizeListResponse";
import type { ApiListResponse } from "@/shared/types/core";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@/features/users/types/user.types";

export async function listUsers() {
  const response = await apiClient<User[] | ApiListResponse<User> | null>("/users", {
    method: "GET",
  });

  return normalizeListResponse(response);
}

export async function createUser(payload: CreateUserPayload) {
  return apiClient<User>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function setUserActive(
  userId: string,
  active: boolean,
) {
  return apiClient<User>(`/users/${userId}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
) {
  return apiClient<User>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: string) {
  return apiClient<{ success: boolean }>(`/users/${userId}`, {
    method: "DELETE",
  });
}
