import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Unitic CMS</p>
        <h1 className="mt-2 text-2xl font-bold">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Enter your account details to continue.</p>

        <div className="mt-5">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
