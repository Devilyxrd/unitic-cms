"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "../../constants/routes";
import { logout } from "@/features/auth/api/login";
import { apiClient } from "@/shared/lib/apiClient";
import { Footer } from "./footer";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const isAuthPage = pathname === ROUTES.login || pathname === ROUTES.register;

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      if (isAuthPage) {
        if (!cancelled) {
          setCheckingSession(false);
        }
        return;
      }

      try {
        await apiClient("/auth/me", { method: "GET" });
        if (!cancelled) {
          setCheckingSession(false);
        }
      } catch {
        await logout();

        if (!cancelled) {
          const nextPath = pathname.startsWith("/") ? pathname : ROUTES.dashboard;
          router.replace(`${ROUTES.login}?next=${encodeURIComponent(nextPath)}`);
        }
      }
    };

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [isAuthPage, pathname, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg) px-4 text-slate-200">
        <p className="text-sm">Oturum doğrulanıyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg) text-slate-100 font-display flex overflow-x-hidden">
      {isSidebarOpen ? (
        <button
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="relative flex min-w-0 flex-1 flex-col bg-(--bg)">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.08]" />
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="relative z-0 flex-1 p-4 md:p-6">{children}</div>

        <Footer />
      </main>
    </div>
  );
}
