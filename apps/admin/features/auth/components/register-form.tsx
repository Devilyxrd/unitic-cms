"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { register } from "@/features/auth/api/register";

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({ email, username, password });
      if (!response.ok) {
        setError(response.message ?? "Kayıt başarısız oldu.");
        return;
      }

      router.push(ROUTES.dashboard);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <label htmlFor="username" className="block text-sm font-medium text-slate-400">
          Kullanıcı Adı
        </label>
        <input
          className="h-10 w-full rounded-xl border border-(--line) bg-(--surface-muted) px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-(--brand) focus:ring-1 focus:ring-(--brand)"
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="ornekkullanici"
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••"
          required
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-400">
          Şifreyi Onayla
        </label>
        <input
          className="h-10 w-full rounded-xl border border-(--line) bg-(--surface-muted) px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-(--brand) focus:ring-1 focus:ring-(--brand)"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••"
          required
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-xl bg-(--brand) text-sm font-semibold text-white transition disabled:opacity-60"
      >
        {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Zaten hesabın var mı?{" "}
        <Link href={ROUTES.login} className="text-(--brand) hover:underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
