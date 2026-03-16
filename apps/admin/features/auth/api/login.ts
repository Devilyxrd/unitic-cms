export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  ok: boolean;
  token?: string;
  message?: string;
};

type LoginApiResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  message?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  if (!payload.email || !payload.password) {
    return { ok: false, message: "Email and password are required." };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as LoginApiResponse;
    if (!response.ok) {
      return { ok: false, message: data.message ?? "Login request failed." };
    }

    const token = data.token ?? data.accessToken ?? data.jwt;
    if (!token) {
      return { ok: false, message: "No token was returned by the API." };
    }

    return { ok: true, token };
  } catch {
    return { ok: false, message: "Cannot reach auth service." };
  }
}
