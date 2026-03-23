"use client";

import { FormEvent, Fragment, useCallback, useEffect, useState } from "react";

import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  addContentField,
  deleteContentField,
  getContentTypeById,
  updateContentField,
} from "@/features/contentTypes/services/content-types.service";
import { BackButton } from "@/shared/components/backButton";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/stateBlocks";
import { ToastStack } from "@/shared/components/toastStack";
import { getAuthToken } from "@/shared/lib/authToken";
import { confirmDestructiveAction } from "@/shared/lib/confirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import { slugify } from "@/shared/utils/helpers";
import type {
  ContentField,
  ContentType,
} from "@/features/contentTypes/types/content-type.types";
import type { User } from "@/features/users/types/user.types";
import type { FieldType } from "@/shared/types/core";

const FIELD_TYPES: FieldType[] = ["TEXT", "RICHTEXT", "NUMBER", "BOOLEAN", "DATE", "MEDIA"];

function fieldTypeLabel(type: FieldType) {
  switch (type) {
    case "TEXT":
      return "Metin";
    case "RICHTEXT":
      return "Zengin Metin";
    case "NUMBER":
      return "Sayı";
    case "BOOLEAN":
      return "Mantıksal";
    case "DATE":
      return "Tarih";
    case "MEDIA":
      return "Medya";
    default:
      return type;
  }
}

type Props = {
  id: string;
};

export function ContentTypeDetailClient({ id }: Props) {
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fieldName, setFieldName] = useState("");
  const [fieldSlug, setFieldSlug] = useState("");
  const [fieldSlugEdited, setFieldSlugEdited] = useState(false);
  const [fieldType, setFieldType] = useState<FieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingFieldId, setUpdatingFieldId] = useState<string | null>(null);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldName, setEditFieldName] = useState("");
  const [editFieldSlug, setEditFieldSlug] = useState("");
  const [editFieldSlugEdited, setEditFieldSlugEdited] = useState(false);
  const [editFieldType, setEditFieldType] = useState<FieldType>("TEXT");
  const [editFieldRequired, setEditFieldRequired] = useState(false);

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getContentTypeById(id, getAuthToken());
      setContentType(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İçerik tipi detayı yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (authError) {
      setLoading(false);
      setContentType(null);
      setError(null);
      return;
    }

    if (currentUser?.role?.toUpperCase() !== "ADMIN") {
      setLoading(false);
      setContentType(null);
      setError(null);
      return;
    }

    void load();
  }, [authChecked, authError, currentUser?.role, load]);

  const handleFieldNameChange = (value: string) => {
    setFieldName(value);
    if (!fieldSlugEdited) {
      setFieldSlug(slugify(value));
    }
  };

  const handleFieldSlugChange = (value: string) => {
    setFieldSlug(value);
    setFieldSlugEdited(true);
  };

  const handleAddField = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const normalizedSlug = fieldSlug.trim() || slugify(fieldName);
      if (!normalizedSlug) {
        setError("Alan slug oluşturmak için alan adı girin.");
        return;
      }

      await addContentField(
        id,
        {
          name: fieldName,
          slug: normalizedSlug,
          type: fieldType,
          required,
        },
        getAuthToken(),
      );
      setFieldName("");
      setFieldSlug("");
      setFieldSlugEdited(false);
      setFieldType("TEXT");
      setRequired(false);
      showSuccess("Alan eklendi", "İçerik tipi alanları güncellendi.");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Alan eklenemedi.";
      setError(message);
      showError("Alan eklenemedi", message);
    } finally {
      setSaving(false);
    }
  };

  const startEditingField = (field: ContentField) => {
    setEditingFieldId(field.id);
    setEditFieldName(field.name);
    setEditFieldSlug(field.slug);
    setEditFieldSlugEdited(false);
    setEditFieldType(field.type);
    setEditFieldRequired(field.required);
  };

  const cancelEditingField = () => {
    setEditingFieldId(null);
    setEditFieldName("");
    setEditFieldSlug("");
    setEditFieldSlugEdited(false);
    setEditFieldType("TEXT");
    setEditFieldRequired(false);
  };

  const handleEditFieldNameChange = (value: string) => {
    setEditFieldName(value);
    if (!editFieldSlugEdited) {
      setEditFieldSlug(slugify(value));
    }
  };

  const handleEditFieldSlugChange = (value: string) => {
    setEditFieldSlug(value);
    setEditFieldSlugEdited(true);
  };

  const handleEditFieldSave = async (field: ContentField) => {
    setUpdatingFieldId(field.id);
    setError(null);

    try {
      const normalizedSlug = editFieldSlug.trim() || slugify(editFieldName);
      if (!normalizedSlug) {
        setError("Alan slug oluşturmak için alan adı girin.");
        return;
      }

      await updateContentField(
        id,
        field.id,
        {
          name: editFieldName.trim(),
          slug: normalizedSlug,
          type: editFieldType,
          required: editFieldRequired,
        },
        getAuthToken(),
      );
      showSuccess("Alan güncellendi", `${field.name} kaydedildi.`);
      cancelEditingField();
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Alan güncellenemedi.";
      setError(message);
      showError("Alan güncellenemedi", message);
    } finally {
      setUpdatingFieldId(null);
    }
  };

  const handleDeleteField = async (field: ContentField) => {
    const shouldDelete = await confirmDestructiveAction({
      title: "Alan silinsin mi?",
      text: `${field.name} alanı ve bu alana bağlı veriler silinecek.`,
      confirmText: "Sil",
      cancelText: "İptal",
    });

    if (!shouldDelete) {
      return;
    }

    setDeletingFieldId(field.id);
    try {
      await deleteContentField(id, field.id, getAuthToken());
      showSuccess("Alan silindi", `${field.name} listeden kaldırıldı.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Alan silinemedi.";
      setError(message);
      showError("Alan silinemedi", message);
    } finally {
      setDeletingFieldId(null);
    }
  };

  if (!authChecked) return <LoadingBlock title="Yetki kontrolü yapılıyor..." />;
  if (authChecked && authError) {
    return (
      <ErrorBlock
        title="Oturum doğrulanamadı"
        description={authError}
        action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void loadCurrentUser()}>Tekrar dene</button>}
      />
    );
  }
  if (authChecked && currentUser?.role?.toUpperCase() !== "ADMIN") {
    return (
      <ErrorBlock
        title="Yetkisiz işlem"
        description={`İçerik tipi oluşturucu sadece admin rolü için erişilebilir. Mevcut oturum rolü: ${currentUser?.role ?? "Bilinmiyor"}.`}
      />
    );
  }
  if (loading) return <LoadingBlock title="İçerik tipi detayı yükleniyor..." />;
  if (error) return <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} />;
  if (!contentType) return <EmptyBlock title="İçerik tipi bulunamadı" description="İstenen şema mevcut değil veya erişim izniniz yok." />;

  return (
    <section className="page-card ui-elevate">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Şema Detayı</p>
          <h1 className="page-title">{contentType.name}</h1>
          <p className="page-subtitle">{contentType.description || "Bu içerik tipi için açıklama eklenmemiş."}</p>
        </div>
        <BackButton />
      </div>

      <form onSubmit={handleAddField} className="mt-3 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-4">
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          placeholder="Alan adı"
          value={fieldName}
          onChange={(event) => handleFieldNameChange(event.target.value)}
          required
        />
        <div className="space-y-1">
          <input
            className="ui-control h-10 w-full rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
            placeholder="Alan slug (URL için kısa ad)"
            value={fieldSlug}
            onChange={(event) => handleFieldSlugChange(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Boş bırakırsan otomatik oluşturulur.</span>
            <button
              type="button"
              className="text-(--brand) hover:underline"
              onClick={() => {
                const autoSlug = slugify(fieldName);
                setFieldSlug(autoSlug);
                setFieldSlugEdited(true);
              }}
            >
              Otomatik oluştur
            </button>
          </div>
        </div>
        <select
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          value={fieldType}
          onChange={(event) => setFieldType(event.target.value as FieldType)}
        >
          {FIELD_TYPES.map((type) => (
            <option key={type} value={type}>
              {fieldTypeLabel(type)}
            </option>
          ))}
        </select>
        <button className="ui-control h-10 rounded-lg bg-(--brand) px-3 text-sm font-semibold text-white disabled:opacity-60" type="submit" disabled={saving}>
          {saving ? "Kaydediliyor..." : "Alan Ekle"}
        </button>

        <label className="md:col-span-4 flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} />
          Zorunlu alan
        </label>
      </form>

      {contentType.fields.length === 0 ? (
        <EmptyBlock title="Henüz alan yok" description="Kayıt eklemek için önce bu içerik tipine alan ekleyin." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-(--line)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-(--surface-muted) text-slate-300">
              <tr>
                <th className="px-4 py-3">Sıra</th>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Tür</th>
                <th className="px-4 py-3">Zorunlu</th>
                <th className="px-4 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {[...contentType.fields]
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <Fragment key={field.id}>
                    <tr className="border-t border-(--line) text-slate-100">
                      <td className="px-4 py-3">{field.order}</td>
                      <td className="px-4 py-3">{field.name}</td>
                      <td className="px-4 py-3 text-slate-300">{field.slug}</td>
                      <td className="px-4 py-3 text-slate-300">{fieldTypeLabel(field.type)}</td>
                      <td className="px-4 py-3 text-slate-300">{field.required ? "Evet" : "Hayır"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => (editingFieldId === field.id ? cancelEditingField() : startEditingField(field))}
                            disabled={updatingFieldId === field.id}
                            className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200 disabled:opacity-60"
                          >
                            {editingFieldId === field.id ? "Düzenlemeyi kapat" : "Düzenle"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteField(field)}
                            disabled={deletingFieldId === field.id}
                            className="ui-control rounded-md border border-rose-500/35 px-2 py-1 text-xs text-rose-300 disabled:opacity-60"
                          >
                            {deletingFieldId === field.id ? "Siliniyor..." : "Sil"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingFieldId === field.id ? (
                      <tr className="border-t border-(--line) bg-(--surface)">
                        <td colSpan={6} className="px-4 py-4">
                          <form
                            className="grid gap-3 md:grid-cols-4"
                            onSubmit={(event) => {
                              event.preventDefault();
                              void handleEditFieldSave(field);
                            }}
                          >
                            <input
                              className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
                              placeholder="Alan adı"
                              value={editFieldName}
                              onChange={(event) => handleEditFieldNameChange(event.target.value)}
                              required
                            />
                            <div className="space-y-1">
                              <input
                                className="ui-control h-10 w-full rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
                                placeholder="Alan slug (URL için kısa ad)"
                                value={editFieldSlug}
                                onChange={(event) => handleEditFieldSlugChange(event.target.value)}
                                required
                              />
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                                <span>Boş bırakırsan otomatik oluşturulur.</span>
                                <button
                                  type="button"
                                  className="text-(--brand) hover:underline"
                                  onClick={() => {
                                    const autoSlug = slugify(editFieldName);
                                    setEditFieldSlug(autoSlug);
                                    setEditFieldSlugEdited(true);
                                  }}
                                >
                                  Otomatik oluştur
                                </button>
                              </div>
                            </div>
                            <select
                              className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
                              value={editFieldType}
                              onChange={(event) => setEditFieldType(event.target.value as FieldType)}
                            >
                              {FIELD_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {fieldTypeLabel(type)}
                                </option>
                              ))}
                            </select>
                            <div className="flex flex-wrap items-center gap-3">
                              <label className="flex items-center gap-2 text-sm text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={editFieldRequired}
                                  onChange={(event) => setEditFieldRequired(event.target.checked)}
                                />
                                Zorunlu alan
                              </label>
                            </div>
                            <div className="md:col-span-4 flex flex-wrap gap-2">
                              <button
                                type="submit"
                                disabled={updatingFieldId === field.id}
                                className="ui-control h-10 rounded-lg bg-(--brand) px-4 text-sm font-semibold text-white disabled:opacity-60"
                              >
                                {updatingFieldId === field.id ? "Kaydediliyor..." : "Kaydet"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingField}
                                className="ui-control h-10 rounded-lg border border-(--line) px-4 text-sm text-slate-200"
                              >
                                Vazgeç
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
