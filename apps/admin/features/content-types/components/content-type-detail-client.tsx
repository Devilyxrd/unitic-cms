"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";

import { addContentField, deleteContentField, getContentTypeById, updateContentField } from "@/features/content-types/api/content-types";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { ToastStack } from "@/shared/components/toast-stack";
import { getAuthToken } from "@/shared/lib/auth-token";
import { confirmDestructiveAction } from "@/shared/lib/confirm-dialog";
import { useToast } from "@/shared/hooks/use-toast";
import type { ContentField, ContentType, FieldType } from "@/types";

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

  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fieldName, setFieldName] = useState("");
  const [fieldSlug, setFieldSlug] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingFieldId, setUpdatingFieldId] = useState<string | null>(null);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);

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
    void load();
  }, [load]);

  const handleAddField = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await addContentField(
        id,
        {
          name: fieldName,
          slug: fieldSlug,
          type: fieldType,
          required,
        },
        getAuthToken(),
      );
      setFieldName("");
      setFieldSlug("");
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

  const handleEditField = async (field: ContentField) => {
    const result = await Swal.fire({
      title: "Alani duzenle",
      html: `
        <input id="swal-field-name" class="swal2-input" placeholder="Alan adi" value="${field.name}" />
        <input id="swal-field-slug" class="swal2-input" placeholder="Alan slug" value="${field.slug}" />
        <select id="swal-field-type" class="swal2-input">
          ${FIELD_TYPES.map((type) => `<option value="${type}" ${type === field.type ? "selected" : ""}>${fieldTypeLabel(type)}</option>`).join("")}
        </select>
        <label style="display:flex;align-items:center;gap:8px;justify-content:center;color:#cbd5e1;margin-top:8px;">
          <input id="swal-field-required" type="checkbox" ${field.required ? "checked" : ""} />
          Zorunlu alan
        </label>
      `,
      showCancelButton: true,
      confirmButtonText: "Kaydet",
      cancelButtonText: "Iptal",
      background: "#0f1420",
      color: "#e2e8f0",
      preConfirm: () => {
        const nameValue = (document.getElementById("swal-field-name") as HTMLInputElement | null)?.value?.trim();
        const slugValue = (document.getElementById("swal-field-slug") as HTMLInputElement | null)?.value?.trim();
        const typeValue = (document.getElementById("swal-field-type") as HTMLSelectElement | null)?.value as FieldType | undefined;
        const requiredValue = (document.getElementById("swal-field-required") as HTMLInputElement | null)?.checked ?? false;

        if (!nameValue || !slugValue || !typeValue) {
          Swal.showValidationMessage("Ad, slug ve tip zorunlu.");
          return null;
        }

        return {
          name: nameValue,
          slug: slugValue,
          type: typeValue,
          required: requiredValue,
        };
      },
    });

    if (!result.isConfirmed || !result.value) {
      return;
    }

    setUpdatingFieldId(field.id);
    try {
      await updateContentField(id, field.id, result.value, getAuthToken());
      showSuccess("Alan guncellendi", `${field.name} kaydedildi.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Alan guncellenemedi.";
      setError(message);
      showError("Alan guncellenemedi", message);
    } finally {
      setUpdatingFieldId(null);
    }
  };

  const handleDeleteField = async (field: ContentField) => {
    const shouldDelete = await confirmDestructiveAction({
      title: "Alan silinsin mi?",
      text: `${field.name} alani ve bu alana bagli veriler silinecek.`,
      confirmText: "Sil",
      cancelText: "Iptal",
    });

    if (!shouldDelete) {
      return;
    }

    setDeletingFieldId(field.id);
    try {
      await deleteContentField(id, field.id, getAuthToken());
      showSuccess("Alan silindi", `${field.name} listeden kaldirildi.`);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Alan silinemedi.";
      setError(message);
      showError("Alan silinemedi", message);
    } finally {
      setDeletingFieldId(null);
    }
  };

  if (loading) return <LoadingBlock title="İçerik tipi detayı yükleniyor..." />;
  if (error) return <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} />;
  if (!contentType) return <EmptyBlock title="İçerik tipi bulunamadı" description="İstenen şema mevcut değil veya erişim izniniz yok." />;

  return (
    <section className="page-card ui-elevate">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <p className="page-kicker">Şema Detayı</p>
      <h1 className="page-title">{contentType.name}</h1>
      <p className="page-subtitle">{contentType.description || "Bu içerik tipi için açıklama eklenmemiş."}</p>

      <form onSubmit={handleAddField} className="mt-3 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-4">
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          placeholder="Alan adı"
          value={fieldName}
          onChange={(event) => setFieldName(event.target.value)}
          required
        />
        <input
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          placeholder="Alan slug"
          value={fieldSlug}
          onChange={(event) => setFieldSlug(event.target.value)}
          required
        />
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
                <th className="px-4 py-3">Islemler</th>
              </tr>
            </thead>
            <tbody>
              {[...contentType.fields]
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <tr key={field.id} className="border-t border-(--line) text-slate-100">
                    <td className="px-4 py-3">{field.order}</td>
                    <td className="px-4 py-3">{field.name}</td>
                    <td className="px-4 py-3 text-slate-300">{field.slug}</td>
                    <td className="px-4 py-3 text-slate-300">{fieldTypeLabel(field.type)}</td>
                    <td className="px-4 py-3 text-slate-300">{field.required ? "Evet" : "Hayır"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleEditField(field)}
                          disabled={updatingFieldId === field.id}
                          className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200 disabled:opacity-60"
                        >
                          {updatingFieldId === field.id ? "Guncelleniyor..." : "Duzenle"}
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
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
