"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { createEntry, listEntries } from "@/features/entries/api/entries";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { getAuthToken } from "@/shared/lib/auth-token";
import type { Entry, EntryStatus } from "@/types";

const STATUS_OPTIONS: EntryStatus[] = ["DRAFT", "PUBLISHED"];

function statusLabel(status: EntryStatus) {
  return status === "PUBLISHED" ? "YAYINLANDI" : "TASLAK";
}

type Props = {
  contentType: string;
};

export function EntriesPageClient({ contentType }: Props) {
  const [items, setItems] = useState<Entry[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | EntryStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<EntryStatus>("DRAFT");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEntries(
        { contentTypeSlug: contentType, ...(statusFilter !== "ALL" ? { status: statusFilter } : {}) },
        getAuthToken(),
      );
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıtlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [contentType, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await createEntry(
        contentType,
        {
          slug,
          status,
          values: [],
        },
        getAuthToken(),
      );
      setSlug("");
      setStatus("DRAFT");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Kayıtlar</p>
      <h1 className="page-title">Kayıtlar: {contentType}</h1>
      <p className="page-subtitle">Bu şema için taslak/yayınlanmış kayıtları oluşturun, filtreleyin ve yönetin.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {(["ALL", ...STATUS_OPTIONS] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatusFilter(option)}
            className={`ui-control rounded-lg border px-3 py-1.5 text-xs font-medium ${
              statusFilter === option
                ? "border-(--brand)/35 bg-(--brand)/15 text-(--brand-soft)"
                : "border-(--line) text-slate-300 hover:bg-white/5"
            }`}
          >
            {option === "ALL" ? "TÜMÜ" : option}
          </button>
        ))}
      </div>

      <form onSubmit={handleCreate} className="mt-4 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-3">
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Kayıt slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
        <select
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          value={status}
          onChange={(event) => setStatus(event.target.value as EntryStatus)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {statusLabel(option)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={creating}
          className="ui-control h-10 rounded-lg bg-(--brand) px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {creating ? "Oluşturuluyor..." : "Kayıt Oluştur"}
        </button>
      </form>

      {error ? <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} /> : null}
      {loading ? <LoadingBlock title="Kayıtlar yükleniyor..." /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyBlock title="Henüz kayıt yok" description="Yayın akışına devam etmek için ilk kaydınızı oluşturun." />
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-(--line)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-(--surface-muted) text-slate-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Güncellendi</th>
                <th className="px-4 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => (
                <tr key={entry.id} className="border-t border-(--line) text-slate-100">
                  <td className="px-4 py-3 text-xs">{entry.id}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.slug || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${entry.status === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                      {statusLabel(entry.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{new Date(entry.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/entries/${contentType}/${entry.id}`} className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">
                      Aç
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
