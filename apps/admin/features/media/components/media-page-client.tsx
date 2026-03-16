"use client";

import { ChangeEvent, useEffect, useState } from "react";

import { deleteMedia, listMedia, uploadMedia } from "@/features/media/api/media";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { ToastStack } from "@/shared/components/toast-stack";
import { apiClient } from "@/shared/lib/api-client";
import { getAuthToken } from "@/shared/lib/auth-token";
import { confirmDestructiveAction } from "@/shared/lib/confirm-dialog";
import { useToast } from "@/shared/hooks/use-toast";
import type { MediaItem, User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function resolveMediaUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function MediaPageClient() {
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const me = await apiClient<User>("/auth/me", { method: "GET" });
        setCurrentUser(me);
      } catch {
        setCurrentUser(null);
      }
    };

    void loadCurrentUser();
  }, []);

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
      showSuccess("Dosya yüklendi", "Medya kütüphanesi güncellendi.");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Dosya yüklenemedi.";
      setError(message);
      showError("Yükleme başarısız", message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };


  const handleDelete = async (item: MediaItem) => {
    const confirmed = await confirmDestructiveAction({
      title: "Medyayi silmek istiyor musun?",
      text: `${item.filename} kalici olarak silinecek.`,
      confirmText: "Sil",
      cancelText: "Iptal",
    });

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setError(null);

    try {
      await deleteMedia(item.id, getAuthToken());
      showSuccess("Medya silindi", `${item.filename} kutuphaneden kaldirildi.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Medya silinemedi.";
      setError(message);
      showError("Silme basarisiz", message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="page-card ui-elevate">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <p className="page-kicker">Varlıklar</p>
      <h1 className="page-title">Medya Kütüphanesi</h1>
      <p className="page-subtitle">Dosya yükleyin ve içerik kayıtlarında tekrar kullanın.</p>

      <div className="mt-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4">
        <label className="text-sm font-medium text-slate-100">Dosya yükle</label>
        <input
          type="file"
          className="ui-control mt-2 block w-full rounded-lg border border-(--line) bg-(--surface) p-2 text-sm text-slate-300"
          onChange={(event) => void handleUpload(event)}
          disabled={uploading}
        />
        <p className="mt-2 text-xs text-slate-400">{uploading ? "Yükleniyor..." : "Desteklenmeyen dosyalarda API hata döndürebilir."}</p>
      </div>

      {error ? <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} /> : null}
      {loading ? <LoadingBlock title="Medya kütüphanesi yükleniyor..." /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyBlock title="Henüz medya yok" description="İlk dosyanı yükledikten sonra burada listelenecek." />
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="ui-elevate rounded-xl border border-(--line) bg-(--surface-muted) p-4">
              <p className="truncate text-sm font-semibold text-slate-100">{item.filename}</p>
              <p className="mt-1 text-xs text-slate-300">{item.mimeType}</p>
              <p className="mt-1 text-xs text-slate-400">{Math.round(item.size / 1024)} KB</p>
              <a href={resolveMediaUrl(item.url)} target="_blank" rel="noreferrer" className="ui-control mt-3 inline-flex rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">
                Dosyayı aç
              </a>
              {currentUser?.role === "ADMIN" ? (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="ui-control rounded-md border border-rose-500/35 px-2 py-1 text-xs text-rose-300 disabled:opacity-60"
                  >
                    {deletingId === item.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
