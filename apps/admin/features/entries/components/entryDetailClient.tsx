"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { listContentTypes } from "@/features/contentTypes/services/content-types.service";
import { getEntryById, updateEntry } from "@/features/entries/services/entries.service";
import { listMedia } from "@/features/media/services/media.service";
import { BackButton } from "@/shared/components/backButton";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/stateBlocks";
import { ToastStack } from "@/shared/components/toastStack";
import { useToast } from "@/shared/hooks/useToast";
import type { ContentField } from "@/features/contentTypes/types/content-type.types";
import type { Entry } from "@/features/entries/types/entry.types";
import type { MediaItem } from "@/features/media/types/media.types";
import type { EntryStatus } from "@/shared/types/core";

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

  const orderedFields = useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, allContentTypes, media] = await Promise.all([
        getEntryById(entryId),
        listContentTypes(),
        listMedia(),
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

      await updateEntry(
        entryId,
        {
          slug: slug.trim() || undefined,
          status,
          values,
        },
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

      <div className="mt-3 grid gap-3 rounded-2xl border border-(--line) bg-(--surface-muted) p-4 md:grid-cols-3">
        <div className="rounded-xl border border-(--line) bg-(--surface) p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Durum</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{statusLabel(entry.status)}</p>
        </div>
        <div className="rounded-xl border border-(--line) bg-(--surface) p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Son Güncelleme</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{new Date(entry.updatedAt).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-(--line) bg-(--surface) p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-400">Alan Sayısı</p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{orderedFields.length} alan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-2 space-y-4 rounded-2xl border border-(--line) bg-[linear-gradient(180deg,rgba(20,27,42,0.94),rgba(15,21,34,0.96))] p-4 md:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Kayıt Ayarları</p>
          <p className="mt-1 text-sm text-slate-300">Slug ve yayın durumunu düzenleyip alan değerlerini güncelleyebilirsin.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1.5 md:col-span-2">
            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Slug (URL için kısa ad)</span>
            <input
              className="ui-control h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20"
              placeholder="ornek-kayit"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <p className="text-xs text-slate-400">Boş bırakırsan kayıt ID&apos;siyle açılır.</p>
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Durum</span>
            <select
              className="ui-control h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-slate-100 outline-none focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20"
              value={status}
              onChange={(event) => setStatus(event.target.value as EntryStatus)}
            >
              <option value="DRAFT">TASLAK</option>
              <option value="PUBLISHED">YAYINLANDI</option>
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-(--line) bg-(--surface-muted) p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Alan Değerleri</p>
            <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-200">
              {orderedFields.length} alan
            </span>
          </div>

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
        </div>

        <div className="flex items-center justify-end border-t border-(--line) pt-3">
          <button
            type="submit"
            disabled={saving}
            className="ui-control inline-flex h-11 items-center rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(19,91,236,0.33)] disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>
    </section>
  );
}
