"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { useLogin } from "@/features/auth/hooks/useLogin";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error, submit } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await submit({ email, password });
    if (!response.ok) {
      return;
    }

    const nextPath = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
    router.push(nextPath && nextPath.startsWith("/") ? nextPath : ROUTES.dashboard);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {searchParams?.get("registered") === "1" ? (
        <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          Kayıt oluşturuldu. Admin paneline erişim için rol ataması gerekir. Admin veya editör hesabıyla giriş yapabilirsiniz.
        </div>
      ) : null}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-400">
          E-posta
        </label>
        <input
          className="h-10 w-full rounded-xl border border-(--line) bg-(--surface-muted) px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-(--brand) focus:ring-1 focus:ring-(--brand)"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ornek@domain.com"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-slate-400">
          Şifre
        </label>
        <input
          className="h-10 w-full rounded-xl border border-(--line) bg-(--surface-muted) px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-(--brand) focus:ring-1 focus:ring-(--brand)"
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

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Henüz hesabın yok mu?{" "}
        <Link href={ROUTES.register} className="text-(--brand) hover:underline">
          Kayıt ol
        </Link>
      </p>
    </form>
  );
}
