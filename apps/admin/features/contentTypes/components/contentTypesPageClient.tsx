"use client";

import { FormEvent, Fragment, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  createContentType,
  deleteContentType,
  listContentTypes,
  updateContentType,
} from "@/features/contentTypes/services/content-types.service";
import { listEntries } from "@/features/entries/services/entries.service";
import { BackButton } from "@/shared/components/backButton";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/stateBlocks";
import { ToastStack } from "@/shared/components/toastStack";
import { getAuthToken } from "@/shared/lib/authToken";
import { confirmDestructiveAction } from "@/shared/lib/confirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import { slugify } from "@/shared/utils/helpers";
import type { ContentType } from "@/features/contentTypes/types/content-type.types";
import type { Entry } from "@/features/entries/types/entry.types";
import type { User } from "@/features/users/types/user.types";

type ContentTypeEntriesSummary = {
  total: number;
  recent: Entry[];
};

export function ContentTypesPageClient() {
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [items, setItems] = useState<ContentType[]>([]);
  const [entriesByType, setEntriesByType] = useState<Record<string, ContentTypeEntriesSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSlugEdited, setEditSlugEdited] = useState(false);
  const [editDescription, setEditDescription] = useState("");

  const loadCurrentUser = useCallback(async () => {
    try {
      const me = await getCurrentUser();
      setCurrentUser(me);
      setAuthError(null);
    } catch (err) {
      setCurrentUser(null);
      setAuthError(err instanceof Error ? err.message : "Oturum bilgisi alınamadı.");
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listContentTypes(getAuthToken());
      setItems(data);

      const entrySummaries = await Promise.all(
        data.map(async (contentType) => {
          const entries = await listEntries({ contentTypeSlug: contentType.slug }, getAuthToken());
          return [
            contentType.id,
            {
              total: entries.length,
              recent: entries.slice(0, 3),
            } satisfies ContentTypeEntriesSummary,
          ] as const;
        }),
      );

      setEntriesByType(Object.fromEntries(entrySummaries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "İçerik tipleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (authError) {
      setLoading(false);
      return;
    }

    void load();
  }, [authChecked, authError]);

  const isAdmin = currentUser?.role?.toUpperCase() === "ADMIN";

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugEdited(true);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const normalizedSlug = slug.trim() || slugify(name);
      if (!normalizedSlug) {
        setError("Slug oluşturmak için içerik tipi adı girin.");
        return;
      }

      await createContentType({ name, slug: normalizedSlug, description }, getAuthToken());
      setName("");
      setSlug("");
      setSlugEdited(false);
      setDescription("");
      showSuccess("İçerik tipi oluşturuldu", "Yeni içerik tipi başarıyla eklendi.");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "İçerik tipi oluşturulamadı.";
      setError(message);
      showError("İçerik tipi oluşturulamadı", message);
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (item: ContentType) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditSlug(item.slug);
    setEditSlugEdited(false);
    setEditDescription(item.description ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
    setEditSlugEdited(false);
    setEditDescription("");
  };

  const handleEditNameChange = (value: string) => {
    setEditName(value);
    if (!editSlugEdited) {
      setEditSlug(slugify(value));
    }
  };

  const handleEditSlugChange = (value: string) => {
    setEditSlug(value);
    setEditSlugEdited(true);
  };

  const handleEditSave = async (item: ContentType) => {
    setUpdatingId(item.id);
    setError(null);

    try {
      const normalizedSlug = editSlug.trim() || slugify(editName);
      if (!normalizedSlug) {
        setError("Slug oluşturmak için içerik tipi adı girin.");
        return;
      }

      await updateContentType(
        item.id,
        {
          name: editName.trim(),
          slug: normalizedSlug,
          description: editDescription.trim(),
        },
        getAuthToken(),
      );
      showSuccess("İçerik tipi güncellendi", `${item.name} kaydedildi.`);
      cancelEditing();
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "İçerik tipi güncellenemedi.";
      showError("Güncelleme başarısız", message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (item: ContentType) => {
    const confirmed = await confirmDestructiveAction({
      title: "İçerik tipini silmek istiyor musun?",
      text: `${item.name} ve bağlı kayıtlar silinecek.`,
      confirmText: "Sil",
      cancelText: "İptal",
    });

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    try {
      await deleteContentType(item.id, getAuthToken());
      showSuccess("İçerik tipi silindi", `${item.name} listeden kaldırıldı.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "İçerik tipi silinemedi.";
      showError("Silme başarısız", message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="page-card ui-elevate">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Şemalar</p>
          <h1 className="page-title">İçerik Tipleri</h1>
          <p className="page-subtitle">Sistemde kullanacağınız içerik yapılarını burada oluşturun.</p>
        </div>
        <BackButton />
      </div>

      {!authChecked ? <LoadingBlock title="Yetki kontrolü yapılıyor..." /> : null}

      {authChecked && authError ? (
        <ErrorBlock
          title="Oturum doğrulanamadı"
          description={authError}
          action={
            <button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void loadCurrentUser()}>
              Tekrar dene
            </button>
          }
        />
      ) : null}

      {authChecked && !authError ? (isAdmin ? (
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-3">
          <input
            className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
            placeholder="İçerik tipi adı (örn. Blog Yazısı)"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
          />
          <div className="space-y-1">
            <input
              className="ui-control h-10 w-full rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
              placeholder="Slug (URL için kısa ad)"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Boş bırakırsan otomatik oluşturulur.</span>
              <button
                type="button"
                className="text-(--brand) hover:underline"
                onClick={() => {
                  const autoSlug = slugify(name);
                  setSlug(autoSlug);
                  setSlugEdited(true);
                }}
              >
                Otomatik oluştur
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="ui-control h-10 rounded-lg bg-(--brand) px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {creating ? "Oluşturuluyor..." : "İçerik Tipi Oluştur"}
          </button>
          <textarea
            className="ui-control md:col-span-3 min-h-20 rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
            placeholder="Kısa açıklama (isteğe bağlı)"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </form>
      ) : (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          İçerik tiplerini yalnızca admin düzenleyebilir. Mevcut oturum rolü: {currentUser?.role ?? "Bilinmiyor"}.
        </p>
      )) : null}

      {error ? <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} /> : null}

      {loading ? <LoadingBlock title="İçerik tipleri yükleniyor..." /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyBlock title="Henüz içerik tipi yok" description="İlk içerik tipini oluşturduktan sonra kayıt ekleyebilirsin." />
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="mt-2 overflow-x-auto rounded-xl border border-(--line)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-(--surface-muted) text-slate-300">
              <tr>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Alanlar</th>
                <th className="px-4 py-3">İçerikler</th>
                <th className="px-4 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Fragment key={item.id}>
                  {(() => {
                    const summary = entriesByType[item.id] ?? { total: 0, recent: [] };
                    return (
                  <tr className="border-t border-(--line) text-slate-100">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-slate-300">{item.slug}</td>
                    <td className="px-4 py-3 text-slate-300">{item.fields?.length ?? 0}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">Toplam kayıt: {summary.total}</p>
                        {summary.recent.length > 0 ? (
                          <div className="flex flex-col gap-1 text-xs">
                            {summary.recent.map((entry) => (
                              <Link
                                key={entry.id}
                                href={`/entries/${item.slug}/${entry.id}`}
                                className="text-slate-200 hover:text-(--brand)"
                              >
                                {entry.slug || entry.id}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Kayıt yok</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/entries/${item.slug}`} className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">
                          Kayıtlar
                        </Link>
                        {isAdmin ? (
                          <>
                            <Link href={`${ROUTES.contentTypes}/${item.id}`} className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">
                              Alanlar
                            </Link>
                            <button
                              type="button"
                              onClick={() => (editingId === item.id ? cancelEditing() : startEditing(item))}
                              disabled={updatingId === item.id}
                              className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200 disabled:opacity-60"
                            >
                              {editingId === item.id ? "Düzenlemeyi kapat" : "Düzenle"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(item)}
                              disabled={deletingId === item.id}
                              className="ui-control rounded-md border border-rose-500/35 px-2 py-1 text-xs text-rose-300 disabled:opacity-60"
                            >
                              {deletingId === item.id ? "Siliniyor..." : "Sil"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                    );
                  })()}
                  {editingId === item.id ? (
                    <tr className="border-t border-(--line) bg-(--surface)">
                      <td colSpan={5} className="px-4 py-4">
                        <form
                          className="grid gap-3 md:grid-cols-3"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void handleEditSave(item);
                          }}
                        >
                          <input
                            className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
                            placeholder="İçerik tipi adı"
                            value={editName}
                            onChange={(event) => handleEditNameChange(event.target.value)}
                            required
                          />
                          <div className="space-y-1">
                            <input
                              className="ui-control h-10 w-full rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
                              placeholder="Slug (URL için kısa ad)"
                              value={editSlug}
                              onChange={(event) => handleEditSlugChange(event.target.value)}
                              required
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                              <span>Boş bırakırsan otomatik oluşturulur.</span>
                              <button
                                type="button"
                                className="text-(--brand) hover:underline"
                                onClick={() => {
                                  const autoSlug = slugify(editName);
                                  setEditSlug(autoSlug);
                                  setEditSlugEdited(true);
                                }}
                              >
                                Otomatik oluştur
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={updatingId === item.id}
                              className="ui-control h-10 rounded-lg bg-(--brand) px-4 text-sm font-semibold text-white disabled:opacity-60"
                            >
                              {updatingId === item.id ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="ui-control h-10 rounded-lg border border-(--line) px-4 text-sm text-slate-200"
                            >
                              Vazgeç
                            </button>
                          </div>
                          <textarea
                            className="ui-control md:col-span-3 min-h-20 rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
                            placeholder="Kısa açıklama (isteğe bağlı)"
                            value={editDescription}
                            onChange={(event) => setEditDescription(event.target.value)}
                          />
                        </form>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
