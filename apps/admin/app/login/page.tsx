import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-8">
      <section className="glass-panel ui-elevate w-full rounded-2xl border border-(--line) p-6 shadow-2xl shadow-black/30">
        <p className="page-kicker">Unitic CMS</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-100">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-300">Enter your account details to continue.</p>

        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
