import type { Id, Role } from "@/shared/types/core";

export type UserDto = {
  id: Id;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

export type CreateUserPayloadDto = {
  email: string;
  username: string;
  password: string;
  role: Role;
};

export type UpdateUserPayloadDto = {
  email?: string;
  username?: string;
  password?: string;
  role?: Role;
};
