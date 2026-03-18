"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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

function fieldTypeLabel(field: ContentField) {
  switch (field.type) {
    case "TEXT":
      return "Kısa Metin";
    case "RICHTEXT":
      return "Uzun Metin";
    case "NUMBER":
      return "Sayı";
    case "BOOLEAN":
      return "Doğru / Yanlış";
    case "DATE":
      return "Tarih";
    case "MEDIA":
      return "Medya";
    default:
      return field.type;
  }
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

  const orderedFields = useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields],
  );

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
    for (const field of orderedFields) {
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

      for (const field of orderedFields) {
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
        <label className="group inline-flex w-full cursor-pointer items-center justify-between rounded-xl border border-(--line) bg-(--surface) px-3 py-2.5 text-sm text-slate-100 transition hover:border-sky-400/40 hover:bg-slate-900/60">
          <span className="text-slate-200">Seçim</span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-sky-500"
            checked={fieldBooleans[field.id] ?? false}
            onChange={(event) =>
              setFieldBooleans((prev) => ({
                ...prev,
                [field.id]: event.target.checked,
              }))
            }
          />
        </label>
      );
    }

    if (field.type === "MEDIA") {
      return (
        <select
          className="ui-control h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20"
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
          className="ui-control min-h-28 w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20"
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
        className="ui-control h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20"
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

      <form onSubmit={handleCreate} className="mt-4 space-y-4 rounded-2xl border border-(--line) bg-[linear-gradient(180deg,rgba(20,27,42,0.94),rgba(15,21,34,0.96))] p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Yeni Kayıt</p>
            <p className="mt-1 text-sm text-slate-300">Temel ayarları belirleyip alanları doldurarak kaydı oluştur.</p>
          </div>
          <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-200">
            {orderedFields.length} alan
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Slug</span>
            <input
              className="ui-control h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20"
              placeholder="URL için kısa ad (boşsa otomatik üretilir)"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <p className="text-xs text-slate-400">Örnek: blog-yazisi-1. Boş bırakırsan sistem başlıktan otomatik slug üretir.</p>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Durum</span>
            <select
              className="ui-control h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20"
              value={status}
              onChange={(event) => setStatus(event.target.value as EntryStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {statusLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-(--line) bg-(--surface-muted) p-3 md:p-4">
          {setupLoading ? <p className="text-sm text-slate-300">Form alanları hazırlanıyor...</p> : null}

          {!setupLoading && orderedFields.length === 0 ? (
            <p className="text-sm text-amber-300">Bu içerik tipinde alan tanımı yok. Önce içerik tipine alan eklemelisin.</p>
          ) : null}

          {!setupLoading && orderedFields.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {orderedFields.map((field) => (
                <div key={field.id} className="space-y-2 rounded-xl border border-(--line) bg-(--surface) p-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">
                      {field.name}
                    </label>
                    <span className="rounded-md border border-slate-700/70 bg-slate-900/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
                      {fieldTypeLabel(field)}
                    </span>
                  </div>

                  {renderFieldInput(field)}

                  <p className="text-[11px] text-slate-500">
                    {field.required ? "Zorunlu alan" : "Opsiyonel alan"}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-(--line) pt-3">
          <button
            type="submit"
            disabled={creating || setupLoading || orderedFields.length === 0}
            className="ui-control inline-flex h-11 items-center rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(19,91,236,0.33)] disabled:opacity-60"
          >
            {creating ? "Oluşturuluyor..." : "Kayıt Oluştur"}
          </button>
        </div>
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
