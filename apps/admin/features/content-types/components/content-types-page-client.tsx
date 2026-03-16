"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { createContentType, listContentTypes } from "@/features/content-types/api/content-types";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { getAuthToken } from "@/shared/lib/auth-token";
import type { ContentType } from "@/types";

export function ContentTypesPageClient() {
  const [items, setItems] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listContentTypes(getAuthToken());
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İçerik tipleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await createContentType({ name, slug, description }, getAuthToken());
      setName("");
      setSlug("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İçerik tipi oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Şemalar</p>
      <h1 className="page-title">İçerik Tipleri</h1>
      <p className="page-subtitle">Dinamik kayıt formlarını besleyen yeniden kullanılabilir içerik modellerini tanımlayın.</p>

      <form onSubmit={handleCreate} className="mt-4 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-3">
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Ad (örn. Blog Yazısı)"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Slug (örn. blog-yazisi)"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="ui-control h-10 rounded-lg bg-(--brand) px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {creating ? "Oluşturuluyor..." : "İçerik Tipi Oluştur"}
        </button>
        <textarea
          className="ui-control md:col-span-3 min-h-20 rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
          placeholder="Açıklama"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </form>

      {error ? <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} /> : null}

      {loading ? <LoadingBlock title="İçerik tipleri yükleniyor..." /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyBlock title="Henüz içerik tipi yok" description="Kayıt eklemeye başlamak için ilk şemanızı oluşturun." />
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="mt-2 overflow-x-auto rounded-xl border border-(--line)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-(--surface-muted) text-slate-300">
              <tr>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Alanlar</th>
                <th className="px-4 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-(--line) text-slate-100">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-slate-300">{item.slug}</td>
                  <td className="px-4 py-3 text-slate-300">{item.fields?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`${ROUTES.contentTypes}/${item.id}`} className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">Detay</Link>
                      <Link href={`/entries/${item.slug}`} className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">Kayıtlar</Link>
                    </div>
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
