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
  message?: string | string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function resolveLoginErrorMessage(status: number) {
  if (status === 401) {
    return "E-posta veya şifre hatalı.";
  }

  if (status === 403) {
    return "Bu panele erişim yetkiniz bulunmuyor.";
  }

  if (status === 400) {
    return "Lütfen e-posta ve şifre alanlarını kontrol edin.";
  }

  return "Giriş şu anda tamamlanamıyor. Lütfen tekrar deneyin.";
}

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
      return {
        ok: false,
        message: resolveLoginErrorMessage(response.status),
      };
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
