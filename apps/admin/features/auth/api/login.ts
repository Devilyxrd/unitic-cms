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
    return { ok: false, message: "E-posta ve şifre zorunludur." };
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
      return { ok: false, message: data.message ?? "Giriş isteği başarısız oldu." };
    }

    const token = data.token ?? data.accessToken ?? data.jwt;
    if (!token) {
      return { ok: false, message: "API tarafından token döndürülmedi." };
    }

    return { ok: true, token };
  } catch {
    return { ok: false, message: "Kimlik doğrulama servisine ulaşılamıyor." };
  }
}
