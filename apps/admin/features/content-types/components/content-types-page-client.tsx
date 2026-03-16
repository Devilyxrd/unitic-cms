"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

import { ROUTES } from "@/constants/routes";
import { createContentType, deleteContentType, listContentTypes, updateContentType } from "@/features/content-types/api/content-types";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { ToastStack } from "@/shared/components/toast-stack";
import { apiClient } from "@/shared/lib/api-client";
import { getAuthToken } from "@/shared/lib/auth-token";
import { confirmDestructiveAction } from "@/shared/lib/confirm-dialog";
import { useToast } from "@/shared/hooks/use-toast";
import type { ContentType, User } from "@/types";

export function ContentTypesPageClient() {
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [items, setItems] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const me = await apiClient<User>("/auth/me", { method: "GET" });
        setCurrentUser(me);
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
      const data = await listContentTypes(getAuthToken());
      setItems(data);
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

    if (currentUser?.role !== "ADMIN") {
      setLoading(false);
      setItems([]);
      setError(null);
      return;
    }

    void load();
  }, [authChecked, currentUser?.role]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      await createContentType({ name, slug, description }, getAuthToken());
      setName("");
      setSlug("");
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

  const handleEdit = async (item: ContentType) => {
    const result = await Swal.fire({
      title: "Icerik tipini duzenle",
      html: `
        <input id="swal-ct-name" class="swal2-input" placeholder="Ad" value="${item.name}" />
        <input id="swal-ct-slug" class="swal2-input" placeholder="Slug" value="${item.slug}" />
        <textarea id="swal-ct-description" class="swal2-textarea" placeholder="Aciklama">${item.description ?? ""}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Kaydet",
      cancelButtonText: "Iptal",
      background: "#0f1420",
      color: "#e2e8f0",
      preConfirm: () => {
        const nameValue = (document.getElementById("swal-ct-name") as HTMLInputElement | null)?.value?.trim();
        const slugValue = (document.getElementById("swal-ct-slug") as HTMLInputElement | null)?.value?.trim();
        const descriptionValue = (document.getElementById("swal-ct-description") as HTMLTextAreaElement | null)?.value?.trim() ?? "";

        if (!nameValue || !slugValue) {
          Swal.showValidationMessage("Ad ve slug zorunlu.");
          return null;
        }

        return {
          name: nameValue,
          slug: slugValue,
          description: descriptionValue,
        };
      },
    });

    if (!result.isConfirmed || !result.value) {
      return;
    }

    setUpdatingId(item.id);
    try {
      await updateContentType(item.id, result.value, getAuthToken());
      showSuccess("Icerik tipi guncellendi", `${item.name} kaydedildi.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Icerik tipi guncellenemedi.";
      showError("Guncelleme basarisiz", message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (item: ContentType) => {
    const confirmed = await confirmDestructiveAction({
      title: "Icerik tipini silmek istiyor musun?",
      text: `${item.name} ve bagli kayitlar silinecek.`,
      confirmText: "Sil",
      cancelText: "Iptal",
    });

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    try {
      await deleteContentType(item.id, getAuthToken());
      showSuccess("Icerik tipi silindi", `${item.name} listeden kaldirildi.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Icerik tipi silinemedi.";
      showError("Silme basarisiz", message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="page-card ui-elevate">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <p className="page-kicker">Şemalar</p>
      <h1 className="page-title">İçerik Tipleri</h1>
      <p className="page-subtitle">Sistemde kullanacağınız içerik yapılarını burada oluşturun.</p>

      {!authChecked ? <LoadingBlock title="Yetki kontrolü yapılıyor..." /> : null}

      {authChecked && currentUser?.role !== "ADMIN" ? (
        <ErrorBlock
          title="Yetkisiz işlem"
          description="Content type builder sadece admin rolü için erişilebilir."
        />
      ) : null}

      {authChecked && currentUser?.role !== "ADMIN" ? null : (
        <>

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
          placeholder="Kısa açıklama (isteğe bağlı)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </form>

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
                      <button
                        type="button"
                        onClick={() => void handleEdit(item)}
                        disabled={updatingId === item.id}
                        className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200 disabled:opacity-60"
                      >
                        {updatingId === item.id ? "Guncelleniyor..." : "Duzenle"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="ui-control rounded-md border border-rose-500/35 px-2 py-1 text-xs text-rose-300 disabled:opacity-60"
                      >
                        {deletingId === item.id ? "Siliniyor..." : "Sil"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
        </>
      )}
    </section>
  );
}
