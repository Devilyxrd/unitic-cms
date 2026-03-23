import { apiClient } from "@/shared/lib/apiClient";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/features/auth/types/auth.types";
import type { User } from "@/features/users/types/user.types";

type LoginApiResponse = {
  ok?: boolean;
  message?: string | string[];
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

export async function getCurrentUser() {
  return apiClient<User>("/auth/me", { method: "GET" });
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
      message:
        "Şifre en az 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.",
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

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => undefined);
}
