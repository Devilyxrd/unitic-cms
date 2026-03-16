import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-8">
      <section className="glass-panel ui-elevate w-full rounded-2xl border border-(--line) p-6 shadow-2xl shadow-black/30">
        <p className="page-kicker">Unitic CMS</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-100">Yeni Hesap Oluştur</h1>
        <p className="mt-2 text-sm text-slate-300">Sistem kullanıcısı olarak kayıt olmak için aşağıdaki bilgileri doldurun.</p>

        <div className="mt-6">
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
