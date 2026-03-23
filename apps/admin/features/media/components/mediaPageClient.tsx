"use client";

import { ChangeEvent, useEffect, useState } from "react";

import {
  ALLOWED_MEDIA_MIME_TYPES,
  deleteMedia,
  listMedia,
  MAX_MEDIA_FILE_SIZE,
  resolveMediaUrl,
  uploadMedia,
  validateMediaFile,
} from "@/features/media/services/media.service";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/stateBlocks";
import { ToastStack } from "@/shared/components/toastStack";
import { confirmDestructiveAction } from "@/shared/lib/confirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import type { MediaItem } from "@/features/media/types/media.types";
import type { User } from "@/features/users/types/user.types";

export function MediaPageClient() {
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const me = await getCurrentUser();
        setCurrentUser(me);
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthChecked(true);
      }
    };

    void loadCurrentUser();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMedia();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Medya yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (!currentUser) {
      setLoading(false);
      setItems([]);
      setError("Medya kütüphanesi için giriş yapılmalı.");
      return;
    }

    void load();
  }, [authChecked, currentUser]);

  const canUpload = currentUser?.role === "ADMIN" || currentUser?.role === "EDITOR";
  const canDelete = currentUser?.role === "ADMIN" || currentUser?.role === "EDITOR";

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validationError = validateMediaFile(file);
    if (validationError) {
      setError(validationError);
      showError("Geçersiz dosya", validationError);
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadMedia(file);
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
      await deleteMedia(item.id);
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

      {!authChecked ? <LoadingBlock title="Yetki kontrolü yapılıyor..." /> : null}

      {authChecked && !canUpload ? (
        <ErrorBlock
          title="Yetkisiz işlem"
          description="Medya kütüphanesi için admin veya editor rolü gerekir."
        />
      ) : null}

      {authChecked && canUpload ? (
        <>
          <div className="mt-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4">
            <label className="text-sm font-medium text-slate-100">Dosya yükle</label>
            <input
              type="file"
              accept={Array.from(ALLOWED_MEDIA_MIME_TYPES).join(",")}
              className="ui-control mt-2 block w-full rounded-lg border border-(--line) bg-(--surface) p-2 text-sm text-slate-300"
              onChange={(event) => void handleUpload(event)}
              disabled={uploading}
            />
            <p className="mt-2 text-xs text-slate-400">
              {uploading
                ? "Yükleniyor..."
                : `Maks ${Math.round(MAX_MEDIA_FILE_SIZE / (1024 * 1024))} MB. Dosyalar sunucuda rastgele harf-rakam adlarla kaydedilir.`}
            </p>
            {!uploading ? (
              <p className="mt-1 text-xs text-amber-300">
                Desteklenen dosyalar: JPG, PNG, GIF, WEBP, SVG. Video, ses, PDF ve doküman dosyaları yüklenemez.
              </p>
            ) : null}
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
                  {canDelete ? (
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
        </>
      ) : null}
    </section>
  );
}
