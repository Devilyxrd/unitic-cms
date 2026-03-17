export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};

export type RegisterResponse = {
  ok: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  message?: string;
};

type RegisterApiResponse = {
  ok?: boolean;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  message?: string | string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function resolveRegisterErrorMessage(status: number) {
  if (status === 403) {
    return "Kayıt şu anda kapalı. Hesap oluşturmak için yöneticiyle iletişime geçin.";
  }

  if (status === 409) {
    return "E-posta veya kullanıcı adı zaten kullanımda.";
  }

  if (status === 400) {
    return "Lütfen form alanlarını kontrol edip tekrar deneyin.";
  }

  return "Kayıt şu anda tamamlanamıyor. Lütfen daha sonra tekrar deneyin.";
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  if (!payload.email || !payload.username || !payload.password) {
    return { ok: false, message: "E-posta, kullanıcı adı ve şifre zorunludur." };
  }

  if (payload.password.length < 8) {
    return { ok: false, message: "Şifre en az 8 karakter olmalıdır." };
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
  if (!strongPassword.test(payload.password)) {
    return {
      ok: false,
      message: "Şifre en az 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as RegisterApiResponse;
    if (!response.ok) {
      return {
        ok: false,
        message: resolveRegisterErrorMessage(response.status),
      };
    }

    return { ok: data.ok ?? true, user: data.user };
  } catch {
    return { ok: false, message: "Kimlik doğrulama servisine ulaşılamıyor." };
  }
}
