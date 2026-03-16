export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  ok: boolean;
  message?: string;
};

type LoginApiResponse = {
  ok?: boolean;
  message?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  if (!payload.email || !payload.password) {
    return { ok: false, message: "E-posta ve şifre zorunludur." };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as LoginApiResponse;
    if (!response.ok) {
      return { ok: false, message: data.message ?? "Giriş isteği başarısız oldu." };
    }

    return { ok: data.ok ?? true };
  } catch {
    return { ok: false, message: "Kimlik doğrulama servisine ulaşılamıyor." };
  }
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => undefined);
}
