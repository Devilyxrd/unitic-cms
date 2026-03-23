export type LoginPayloadDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  ok: boolean;
  message?: string;
};

export type RegisterPayloadDto = {
  email: string;
  username: string;
  password: string;
};

export type RegisterResponseDto = {
  ok: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  message?: string;
};
