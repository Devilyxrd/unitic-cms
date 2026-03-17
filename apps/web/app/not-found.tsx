import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="glass-card flex flex-col items-start gap-4 p-10">
        <span className="pill">404</span>
        <h1 className="text-3xl font-bold text-slate-900">İçerik bulunamadı</h1>
        <p className="text-base text-slate-600">
          Aradığınız içerik yayınlanmamış olabilir ya da hiç var olmamış olabilir.
        </p>
        <Link href="/" className="text-sm font-semibold text-teal-700 hover:text-teal-600">
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
