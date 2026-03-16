import type { ReactNode } from "react";

type StateBlockProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function LoadingBlock({ title = "Yükleniyor..." }: { title?: string }) {
  return (
    <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 text-sm text-slate-300">
      {title}
    </div>
  );
}

export function ErrorBlock({ title, description, action }: StateBlockProps) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
      <p className="text-sm font-semibold text-rose-300">{title}</p>
      <p className="mt-1 text-sm text-rose-200/90">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function EmptyBlock({ title, description, action }: StateBlockProps) {
  return (
    <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
