"use client";

import { useState } from "react";

import { login } from "@/features/auth/services/auth.service";
import type { LoginPayload, LoginResponse } from "@/features/auth/types/auth.types";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: LoginPayload): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(payload);

      if (!response.ok) {
        setError(response.message ?? "Giriş başarısız.");
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, submit };
}
