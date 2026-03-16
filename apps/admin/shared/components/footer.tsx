export function Footer() {
  return (
    <footer className="glass-panel mt-auto shrink-0 border-t border-(--line) px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-300">Unitic CMS Yönetim Paneli - İçerik işlemleri ve yönetimi.</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">Sürüm 1.0.0</span>
          <span className="text-emerald-300">Durum: Kararlı</span>
          <a className="ui-control text-(--brand-soft) hover:text-blue-300" href="#">
            Sistem durumu
          </a>
        </div>
      </div>
    </footer>
  );
}
