"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type LucideIcon,
  Image as ImageIcon,
  LayoutDashboard,
  Network,
  Settings,
  Shapes,
  UserRound,
  X,
  LogOut,
} from "lucide-react";

import { AUTH_COOKIE_NAME, NAV_ITEMS, ROUTES } from "@/constants/routes";
import { cn } from "@/shared/utils/helpers";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const NAV_ICON_BY_HREF: Record<string, LucideIcon> = {
  [ROUTES.dashboard]: LayoutDashboard,
  [ROUTES.contentTypes]: Shapes,
  [ROUTES.media]: ImageIcon,
  [ROUTES.users]: UserRound,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
    router.push(ROUTES.login);
    onClose();
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-(--line) bg-[#0e1116]",
        "transform transition-transform duration-200 md:static md:z-20 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-(--line) px-6">
        <div className="neon-glow flex size-8 items-center justify-center rounded-full bg-(--brand)/20 text-(--brand-soft)">
          <Network className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-bold tracking-wider text-white">UNITIC CMS</h1>
        <button
          className="ml-auto text-slate-400 hover:text-white md:hidden"
          type="button"
          onClick={onClose}
          aria-label="Menüyü kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6">
        <div className="flex flex-col gap-1">
          <div className="ui-elevate mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
            <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-full border border-(--brand)/30 bg-(--brand)/15 text-xs font-bold text-(--brand-soft)">
              <Image
                className="object-cover"
                src="https://i.pinimg.com/736x/c2/7c/ee/c27cee67807985d5220478e495be5919.jpg"
                alt="Devilyxrd tarafından hazırlandı"
                fill
                sizes="36px"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">Devilyxrd</p>
              <p className="truncate text-xs text-slate-300">Kurucu ve Yönetici</p>
            </div>
          </div>

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Yönetim Paneli</p>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = NAV_ICON_BY_HREF[item.href] ?? LayoutDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "ui-control flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium",
                  active
                    ? "border-(--brand)/30 bg-(--brand)/10 text-(--brand-soft)"
                    : "border-transparent text-slate-300 hover:bg-white/5 hover:text-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-(--line) p-4">
        <Link
          href="#"
          className="ui-control flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-slate-100"
        >
          <Settings className="h-4 w-4" />
          <span>Ayarlar</span>
        </Link>

        <button
          type="button"
          className="ui-control mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-slate-100"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Çıkış yap
        </button>
      </div>
    </aside>
  );
}
