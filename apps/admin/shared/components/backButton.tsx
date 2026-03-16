"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  label?: string;
  className?: string;
};

export function BackButton({ label = "Geri dön", className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={className ?? "ui-control inline-flex items-center gap-2 rounded-lg border border-(--line) px-3 py-1.5 text-xs text-slate-200"}
    >
      {label}
    </button>
  );
}
