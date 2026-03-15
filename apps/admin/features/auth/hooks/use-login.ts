"use client";

import { useState } from "react";

import { login, type LoginPayload, type LoginResponse } from "../api/login";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: LoginPayload): Promise<LoginResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(payload);

      if (!response.ok) {
        setError(response.message ?? "Login failed.");
      }

      return response;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, submit };
}
