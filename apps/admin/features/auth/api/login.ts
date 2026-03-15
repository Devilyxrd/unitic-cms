export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  ok: boolean;
  token?: string;
  message?: string;
};

export async function login(payload: LoginPayload) {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (!payload.email || !payload.password) {
    return { ok: false, message: "Email and password are required." } satisfies LoginResponse;
  }

  return { ok: true, token: "dev-admin-session" } satisfies LoginResponse;
}
