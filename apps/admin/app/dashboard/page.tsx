import Link from "next/link";

const WORKFLOWS = [
  {
    href: "/content-types",
    title: "1. İçerik Tiplerini Tanımla",
    description: "Dinamik kayıt formlarını besleyen şema ve alan tanımlarını oluşturun.",
  },
  {
    href: "/media",
    title: "2. Medya Yükle",
    description: "Varlıkları yükleyin ve medya alanı seçimleri için hazır tutun.",
  },
  {
    href: "/users",
    title: "3. Rolleri Yönet",
    description: "Rol tabanlı erişim sınırlarıyla Yönetici ve Editör hesapları oluşturun.",
  },
] as const;

export default function DashboardPage() {
  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Genel Bakış</p>
      <h1 className="page-title">Başsız CMS İş Akışı</h1>
      <p className="page-subtitle">
        Bu panel backend entegrasyonu için hazırlandı. API modülleri tamamlandığında aşağıdaki akışlar tamamen çalışır hale gelir.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {WORKFLOWS.map((workflow) => (
          <article key={workflow.href} className="ui-elevate rounded-xl border border-(--line) bg-(--surface-muted) p-4">
            <h2 className="text-sm font-semibold text-slate-100">{workflow.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{workflow.description}</p>
            <Link href={workflow.href} className="ui-control mt-3 inline-flex rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-200">
              Aç
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
