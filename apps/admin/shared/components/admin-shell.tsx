"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { ROUTES } from "../../constants/routes";
import { Footer } from "./footer";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoginPage = pathname === ROUTES.login;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-(--bg) text-slate-100 font-display flex overflow-x-hidden">
      {isSidebarOpen ? (
        <button
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          type="button"
          aria-label="Close menu"
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
