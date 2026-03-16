"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { listMedia, uploadMedia } from "@/features/media/api/media";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { getAuthToken } from "@/shared/lib/auth-token";
import type { MediaItem } from "@/types";

export function MediaPageClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMedia(getAuthToken());
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Medya yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadMedia(file, getAuthToken());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya yüklenemedi.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Varlıklar</p>
      <h1 className="page-title">Medya Kütüphanesi</h1>
      <p className="page-subtitle">Dosya yükleyin ve kayıt düzenlerken medya alanlarında tekrar kullanın.</p>

      <div className="mt-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4">
        <label className="text-sm font-medium text-slate-100">Dosya yükle</label>
        <input
          type="file"
          className="ui-control mt-2 block w-full rounded-lg border border-(--line) bg-(--surface) p-2 text-sm text-slate-300"
          onChange={(event) => void handleUpload(event)}
          disabled={uploading}
        />
        <p className="mt-2 text-xs text-slate-400">{uploading ? "Yükleniyor..." : "Backend doğrulama kurallarına tabidir."}</p>
      </div>

      {error ? <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} /> : null}
      {loading ? <LoadingBlock title="Medya kütüphanesi yükleniyor..." /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyBlock title="Henüz medya yüklenmedi" description="Kayıtlara medya bağlamak için ilk dosyanızı yükleyin." />
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="ui-elevate rounded-xl border border-(--line) bg-(--surface-muted) p-4">
              <p className="truncate text-sm font-semibold text-slate-100">{item.filename}</p>
              <p className="mt-1 text-xs text-slate-300">{item.mimeType}</p>
              <p className="mt-1 text-xs text-slate-400">{Math.round(item.size / 1024)} KB</p>
              <a href={item.url} target="_blank" rel="noreferrer" className="ui-control mt-3 inline-flex rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">
                Dosyayı aç
              </a>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
