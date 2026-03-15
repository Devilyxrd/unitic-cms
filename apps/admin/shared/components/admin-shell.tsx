"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { Sidebar } from "@/shared/components/sidebar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === ROUTES.login;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-content">{children}</main>
    </div>
  );
}
