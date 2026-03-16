"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { listContentTypes } from "@/features/contentTypes/api/contentTypes";
import { getEntryById, updateEntry } from "@/features/entries/api/entries";
import { listMedia } from "@/features/media/api/media";
import { BackButton } from "@/shared/components/backButton";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/stateBlocks";
import { ToastStack } from "@/shared/components/toastStack";
import { getAuthToken } from "@/shared/lib/authToken";
import { useToast } from "@/shared/hooks/useToast";
import type { ContentField, Entry, EntryStatus, MediaItem } from "@/types";

function statusLabel(status: EntryStatus) {
  return status === "PUBLISHED" ? "YAYINLANDI" : "TASLAK";
}

type Props = {
  entryId: string;
  contentType: string;
};

export function EntryDetailClient({ entryId, contentType }: Props) {
  const { toasts, dismissToast, showError, showSuccess } = useToast();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [fields, setFields] = useState<ContentField[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<EntryStatus>("DRAFT");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldBooleans, setFieldBooleans] = useState<Record<string, boolean>>({});
  const [fieldMediaIds, setFieldMediaIds] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const [data, allContentTypes, media] = await Promise.all([
        getEntryById(entryId, token),
        listContentTypes(token),
        listMedia(token),
      ]);

      const currentContentType = allContentTypes.find((item) => item.slug === contentType);
      if (!currentContentType) {
        throw new Error("İçerik tipi bulunamadı.");
      }

      setEntry(data);
      setFields(currentContentType.fields ?? []);
      setMediaItems(media);

      setSlug(data.slug ?? "");
      setStatus(data.status);

      const nextTextValues: Record<string, string> = {};
      const nextBooleanValues: Record<string, boolean> = {};
      const nextMediaValues: Record<string, string> = {};

      for (const field of currentContentType.fields ?? []) {
        const value = data.values.find((item) => item.fieldId === field.id);

        if (field.type === "BOOLEAN") {
          nextBooleanValues[field.id] = typeof value?.value === "boolean" ? value.value : false;
          continue;
        }

        if (field.type === "MEDIA") {
          nextMediaValues[field.id] = value?.mediaId ?? "";
          continue;
        }

        if (typeof value?.value === "string") {
          nextTextValues[field.id] = value.value;
          continue;
        }

        if (typeof value?.value === "number") {
          nextTextValues[field.id] = String(value.value);
          continue;
        }

        nextTextValues[field.id] = "";
      }

      setFieldValues(nextTextValues);
      setFieldBooleans(nextBooleanValues);
      setFieldMediaIds(nextMediaValues);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt detayı yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [entryId, contentType]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = getValidationError();
    if (validationError) {
      showError("Kayıt güncellenemedi", validationError);
      return;
    }

    setSaving(true);
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

      await updateEntry(
        entryId,
        {
          slug: slug.trim() || undefined,
          status,
          values,
        },
        getAuthToken(),
      );

      showSuccess("Kayıt güncellendi", "Değişiklikler kaydedildi.");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kayıt güncellenemedi.";
      setError(message);
      showError("Kayıt güncellenemedi", message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock title="Kayıt detayı yükleniyor..." />;
  if (error) return <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} />;
  if (!entry) return <EmptyBlock title="Kayıt bulunamadı" description="Bu kayıt silinmiş olabilir veya erişilebilir değil." />;

  return (
    <section className="page-card ui-elevate">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="page-kicker">Kayıt Detayı</p>
          <h1 className="page-title">Kayıt: {entry.slug || entry.id}</h1>
          <p className="page-subtitle">İçerik tipi: {contentType}</p>
        </div>
        <BackButton />
      </div>

      <div className="mt-3 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Durum</p>
          <p className="mt-1 text-sm text-slate-100">{statusLabel(entry.status)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Son Güncelleme</p>
          <p className="mt-1 text-sm text-slate-100">{new Date(entry.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-2 grid gap-3 rounded-xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-[0.06em] text-slate-400">Slug (URL için kısa ad)</label>
          <input
            className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
            placeholder="ornek-kayit"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">Boş bırakırsan kayıt ID&apos;siyle açılır.</p>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium uppercase tracking-[0.06em] text-slate-400">Durum</label>
          <select
            className="ui-control h-10 rounded-lg border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none"
            value={status}
            onChange={(event) => setStatus(event.target.value as EntryStatus)}
          >
            <option value="DRAFT">TASLAK</option>
            <option value="PUBLISHED">YAYINLANDI</option>
          </select>
        </div>

        {fields.map((field) => (
          <div key={field.id} className="space-y-1 md:col-span-1">
            <label className="block text-xs font-medium uppercase tracking-[0.06em] text-slate-400">
              {field.name} ({field.type})
            </label>
            {renderFieldInput(field)}
          </div>
        ))}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="ui-control h-10 rounded-lg bg-(--brand) px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>
    </section>
  );
}
