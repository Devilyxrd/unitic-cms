"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { listContentTypes } from "@/features/contentTypes/api/contentTypes";
import { createEntry, deleteEntry, listEntries } from "@/features/entries/api/entries";
import { listMedia } from "@/features/media/api/media";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/stateBlocks";
import { ToastStack } from "@/shared/components/toastStack";
import { getAuthToken } from "@/shared/lib/authToken";
import { confirmDestructiveAction } from "@/shared/lib/confirmDialog";
import { useToast } from "@/shared/hooks/useToast";
import { BackButton } from "@/shared/components/backButton";
import type { ContentField, Entry, EntryStatus, MediaItem } from "@/types";

const STATUS_OPTIONS: EntryStatus[] = ["DRAFT", "PUBLISHED"];

function statusLabel(status: EntryStatus) {
  return status === "PUBLISHED" ? "YAYINLANDI" : "TASLAK";
}

type Props = {
  contentType: string;
};

export function EntriesPageClient({ contentType }: Props) {
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const [items, setItems] = useState<Entry[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | EntryStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contentTypeName, setContentTypeName] = useState(contentType);
  const [fields, setFields] = useState<ContentField[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [setupLoading, setSetupLoading] = useState(true);

  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<EntryStatus>("DRAFT");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldBooleans, setFieldBooleans] = useState<Record<string, boolean>>({});
  const [fieldMediaIds, setFieldMediaIds] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEntries(
        { contentTypeSlug: contentType, ...(statusFilter !== "ALL" ? { status: statusFilter } : {}) },
        getAuthToken(),
      );
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kayıtlar yüklenemedi.";
      setError(message);
      showError("Kayıt listesi alınamadı", message);
    } finally {
      setLoading(false);
    }
  }, [contentType, statusFilter, showError]);

  const loadSetup = useCallback(async () => {
    setSetupLoading(true);
    setError(null);

    try {
      const [allContentTypes, media] = await Promise.all([listContentTypes(getAuthToken()), listMedia(getAuthToken())]);
      const current = allContentTypes.find((item) => item.slug === contentType);

      if (!current) {
        throw new Error("İçerik tipi bulunamadı.");
      }

      setContentTypeName(current.name);
      setFields(current.fields ?? []);
      setMediaItems(media);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Form bilgileri yüklenemedi.";
      setError(message);
      showError("Form hazırlanamadı", message);
    } finally {
      setSetupLoading(false);
    }
  }, [contentType, showError]);

  useEffect(() => {
    void loadSetup();
  }, [loadSetup]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    const nextTextValues: Record<string, string> = {};
    const nextBooleanValues: Record<string, boolean> = {};
    const nextMediaValues: Record<string, string> = {};

    for (const field of fields) {
      if (field.type === "BOOLEAN") {
        nextBooleanValues[field.id] = false;
      } else if (field.type === "MEDIA") {
        nextMediaValues[field.id] = "";
      } else {
        nextTextValues[field.id] = "";
      }
    }

    setFieldValues(nextTextValues);
    setFieldBooleans(nextBooleanValues);
    setFieldMediaIds(nextMediaValues);
  }, [fields]);

  const getValidationError = () => {
    for (const field of fields) {
      if (field.type === "MEDIA") {
        const mediaId = fieldMediaIds[field.id] ?? "";
        if (field.required && !mediaId) {
          return `${field.name} alanı zorunlu.`;
        }
        continue;
      }

      if (field.type === "BOOLEAN") {
        continue;
      }

      const value = fieldValues[field.id] ?? "";
      if (field.required && !value.trim()) {
        return `${field.name} alanı zorunlu.`;
      }

      if (field.type === "NUMBER" && value.trim()) {
        if (Number.isNaN(Number(value))) {
          return `${field.name} alanı sayı olmalı.`;
        }
      }
    }

    return null;
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (fields.length === 0) {
      const message = "Bu içerik tipinde alan tanımı yok. Önce içerik tipine alan eklemelisin.";
      setError(message);
      showError("Kayıt oluşturulamadı", message);
      return;
    }

    const validationError = getValidationError();
    if (validationError) {
      showError("Kayıt oluşturulamadı", validationError);
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const values: Array<{ fieldId: string; value?: unknown; mediaId?: string | null }> = [];

      for (const field of fields) {
        if (field.type === "MEDIA") {
          const mediaId = fieldMediaIds[field.id] ?? "";
          if (!mediaId && !field.required) {
            continue;
          }

          values.push({ fieldId: field.id, mediaId: mediaId || null });
          continue;
        }

        if (field.type === "BOOLEAN") {
          values.push({ fieldId: field.id, value: fieldBooleans[field.id] ?? false });
          continue;
        }

        const raw = fieldValues[field.id] ?? "";
        if (!raw.trim() && !field.required) {
          continue;
        }

        if (field.type === "NUMBER") {
          values.push({ fieldId: field.id, value: Number(raw) });
          continue;
        }

        values.push({ fieldId: field.id, value: raw });
      }

      await createEntry(
        contentType,
        {
          slug: slug.trim() || undefined,
          status,
          values,
        },
        getAuthToken(),
      );

      setSlug("");
      setStatus("DRAFT");
      setFieldValues((prev) => Object.fromEntries(Object.keys(prev).map((key) => [key, ""])));
      setFieldBooleans((prev) => Object.fromEntries(Object.keys(prev).map((key) => [key, false])));
      setFieldMediaIds((prev) => Object.fromEntries(Object.keys(prev).map((key) => [key, ""])));

      showSuccess("Kayıt oluşturuldu", "Yeni kayıt başarıyla eklendi.");
      await loadEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kayıt oluşturulamadı.";
      setError(message);
      showError("Kayıt oluşturulamadı", message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const shouldDelete = await confirmDestructiveAction({
      title: "Kayıt silinsin mi?",
      text: "Bu işlem geri alınmaz.",
      confirmText: "Sil",
      cancelText: "İptal",
    });
    if (!shouldDelete) {
      return;
    }

    setDeletingEntryId(entryId);
    try {
      await deleteEntry(entryId, getAuthToken());
      showSuccess("Kayıt silindi", "Kayıt listeden kaldırıldı.");
      await loadEntries();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kayıt silinemedi.";
      showError("Kayıt silinemedi", message);
    } finally {
      setDeletingEntryId(null);
    }
  };

  const renderFieldInput = (field: ContentField) => {
    if (field.type === "BOOLEAN") {
      return (
        <label className="flex items-center gap-2 text-sm text-slate-100">
          <input
            type="checkbox"
            checked={fieldBooleans[field.id] ?? false}
            onChange={(event) =>
              setFieldBooleans((prev) => ({
                ...prev,
                [field.id]: event.target.checked,
              }))
            }
          />
          {field.required ? `${field.name} (zorunlu)` : field.name}
        </label>
      );
    }

    if (field.type === "MEDIA") {
      return (
        <select
          className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
          value={fieldMediaIds[field.id] ?? ""}
          onChange={(event) =>
            setFieldMediaIds((prev) => ({
              ...prev,
              [field.id]: event.target.value,
            }))
          }
          required={field.required}
        >
          <option value="">{field.required ? "Medya seçin" : "Medya seçimi (opsiyonel)"}</option>
          {mediaItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.filename}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "RICHTEXT") {
      return (
        <textarea
          className="ui-control min-h-24 rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
          placeholder={`${field.name}${field.required ? " (zorunlu)" : ""}`}
          value={fieldValues[field.id] ?? ""}
          onChange={(event) =>
            setFieldValues((prev) => ({
              ...prev,
              [field.id]: event.target.value,
            }))
          }
          required={field.required}
        />
      );
    }

    return (
      <input
        className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
        type={field.type === "NUMBER" ? "number" : field.type === "DATE" ? "date" : "text"}
        placeholder={`${field.name}${field.required ? " (zorunlu)" : ""}`}
        value={fieldValues[field.id] ?? ""}
        onChange={(event) =>
          setFieldValues((prev) => ({
            ...prev,
            [field.id]: event.target.value,
          }))
        }
        required={field.required}
      />
    );
  };

  return (
    <section className="page-card ui-elevate">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Kayıtlar</p>
          <h1 className="page-title">Kayıtlar: {contentTypeName}</h1>
          <p className="page-subtitle">Bu içerik tipi için kayıt ekleyin, filtreleyin ve durumunu yönetin.</p>
        </div>
        <BackButton />
      </div>

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
        <div className="space-y-1">
          <input
            className="ui-control h-10 w-full rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
            placeholder="URL için kısa ad (boşsa otomatik üretilir)"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
          <p className="text-xs text-slate-400">Örnek: blog-yazisi-1. Boş bırakırsan sistem başlıktan otomatik slug üretir.</p>
        </div>
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
          disabled={creating || setupLoading || fields.length === 0}
          className="ui-control h-10 rounded-lg bg-(--brand) px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {creating ? "Oluşturuluyor..." : "Kayıt Oluştur"}
        </button>

        {setupLoading ? <p className="md:col-span-3 text-sm text-slate-300">Form alanları hazırlanıyor...</p> : null}

        {!setupLoading && fields.length === 0 ? (
          <p className="md:col-span-3 text-sm text-amber-300">Bu içerik tipinde alan tanımı yok. Önce içerik tipine alan eklemelisin.</p>
        ) : null}

        {!setupLoading && fields.length > 0 ? (
          <div className="md:col-span-3 grid gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="block text-xs font-medium uppercase tracking-[0.06em] text-slate-400">
                  {field.name} ({field.type})
                </label>
                {renderFieldInput(field)}
              </div>
            ))}
          </div>
        ) : null}
      </form>

      {error ? <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void loadEntries()}>Tekrar dene</button>} /> : null}
      {loading ? <LoadingBlock title="Kayıtlar yükleniyor..." /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyBlock title="Henüz kayıt yok" description="İlk kaydı oluşturup içerik akışını başlatabilirsin." />
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
                    <div className="flex items-center gap-2">
                      <Link href={`/entries/${contentType}/${entry.id}`} className="ui-control rounded-md border border-(--line) px-2 py-1 text-xs text-slate-200">
                        Aç
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDeleteEntry(entry.id)}
                        disabled={deletingEntryId === entry.id}
                        className="ui-control rounded-md border border-rose-500/35 px-2 py-1 text-xs text-rose-300 disabled:opacity-60"
                      >
                        {deletingEntryId === entry.id ? "Siliniyor..." : "Sil"}
                      </button>
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
