"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AUTH_COOKIE_NAME, ROUTES } from "@/constants/routes";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { useLogin } from "@/features/auth/hooks/use-login";

export function LoginForm() {
  const router = useRouter();
  const { loading, error, submit } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await submit({ email, password });
    if (!response.ok || !response.token) {
      return;
    }

    document.cookie = `${AUTH_COOKIE_NAME}=${response.token}; path=/; max-age=86400; samesite=lax`;
    router.push(ROUTES.dashboard);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-600">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@unitic.dev"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-slate-600">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
