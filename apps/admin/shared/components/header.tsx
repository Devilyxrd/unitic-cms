"use client";

import { Bell, Menu, Search } from "lucide-react";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="glass-panel sticky top-0 z-10 flex h-16 items-center justify-between border-b border-(--line) px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button
          className="ui-control text-slate-300 hover:text-slate-100 md:hidden"
          type="button"
          aria-label="Menüyü aç"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="ui-control hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 sm:flex">
          <div className="size-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-bold tracking-wide text-emerald-300">
            SİSTEM AKTİF
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="ui-control w-64 rounded-lg border border-(--line) bg-(--surface-muted) py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-(--brand) focus:outline-none"
            placeholder="Kayıt, kullanıcı, medya ara..."
            type="text"
          />
        </div>

        <button
          type="button"
          className="ui-control rounded-lg p-2 text-slate-300 hover:bg-white/5 hover:text-slate-100"
          aria-label="Bildirimler"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
