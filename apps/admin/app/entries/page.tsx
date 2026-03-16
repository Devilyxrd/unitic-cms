import Link from "next/link";

export default function EntriesIndexPage() {
  return (
    <section className="space-y-4 rounded-2xl border border-(--line) bg-(--panel)/85 p-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-100">Kayıtlar</h1>
      <p className="max-w-2xl text-sm text-slate-300">
        Önce bir içerik tipi seçin, ardından ilgili liste sayfasından kayıtlarını yönetin.
      </p>
      <Link
        href="/contentTypes"
        className="ui-control inline-flex items-center rounded-md border border-(--line) px-3 py-2 text-sm font-medium text-slate-100"
      >
        İçerik tiplerine git
      </Link>
    </section>
  );
}
