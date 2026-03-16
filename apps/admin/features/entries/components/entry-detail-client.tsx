"use client";

import { useCallback, useEffect, useState } from "react";

import { getEntryById, updateEntryStatus } from "@/features/entries/api/entries";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { getAuthToken } from "@/shared/lib/auth-token";
import type { Entry, EntryStatus } from "@/types";

function statusLabel(status: EntryStatus) {
  return status === "PUBLISHED" ? "YAYINLANDI" : "TASLAK";
}

type Props = {
  entryId: string;
  contentType: string;
};

export function EntryDetailClient({ entryId, contentType }: Props) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<EntryStatus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEntryById(entryId, getAuthToken());
      setEntry(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt detayı yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (status: EntryStatus) => {
    setSavingStatus(status);
    setError(null);
    try {
      await updateEntryStatus(entryId, status, getAuthToken());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi.");
    } finally {
      setSavingStatus(null);
    }
  };

  if (loading) return <LoadingBlock title="Kayıt detayı yükleniyor..." />;
  if (error) return <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} />;
  if (!entry) return <EmptyBlock title="Kayıt bulunamadı" description="Bu kayıt silinmiş olabilir veya erişilebilir değil." />;

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Kayıt Detayı</p>
      <h1 className="page-title">Kayıt: {entry.slug || entry.id}</h1>
      <p className="page-subtitle">İçerik tipi rotası: {contentType}</p>

      <div className="mt-3 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Durum</p>
          <p className="mt-1 text-sm text-slate-100">{statusLabel(entry.status)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Son Güncelleme</p>
          <p className="mt-1 text-sm text-slate-100">{new Date(entry.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={savingStatus !== null}
          className="ui-control rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 disabled:opacity-60"
          onClick={() => void setStatus("DRAFT")}
        >
          {savingStatus === "DRAFT" ? "Kaydediliyor..." : "Taslak Yap"}
        </button>
        <button
          type="button"
          disabled={savingStatus !== null}
          className="ui-control rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 disabled:opacity-60"
          onClick={() => void setStatus("PUBLISHED")}
        >
          {savingStatus === "PUBLISHED" ? "Kaydediliyor..." : "Yayınla"}
        </button>
      </div>

      <div className="mt-2 rounded-xl border border-(--line) bg-(--surface-muted) p-4">
        <p className="text-sm font-semibold text-slate-100">Dinamik değerler</p>
        <p className="mt-1 text-sm text-slate-300">Kayıt değerleri içerik tipi alan tanımlarından gelir ve dinamik form bileşeniyle düzenlenmelidir.</p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-(--line) bg-(--surface) p-3 text-xs text-slate-300">
          {JSON.stringify(entry.values, null, 2)}
        </pre>
      </div>
    </section>
  );
}
