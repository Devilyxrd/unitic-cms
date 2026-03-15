"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AUTH_COOKIE_NAME, NAV_ITEMS, ROUTES } from "@/constants/routes";
import { cn } from "@/shared/utils/helpers";
import { Button } from "@/shared/components/button";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
    router.push(ROUTES.login);
  };

  return (
    <aside className="border-r border-slate-200 bg-white/85 p-5 backdrop-blur-md">
      <div className="rounded-2xl bg-slate-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Unitic</p>
        <h2 className="mt-1 text-lg font-bold">Admin Panel</h2>
      </div>

      <nav className="mt-6 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-teal-700 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-slate-200 pt-4">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
