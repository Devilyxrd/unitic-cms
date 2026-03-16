"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { getContentTypeById } from "@/features/content-types/api/content-types";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/shared/components/state-blocks";
import { getAuthToken } from "@/shared/lib/auth-token";
import { apiClient } from "@/shared/lib/api-client";
import type { ContentType, FieldType } from "@/types";

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
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fieldName, setFieldName] = useState("");
  const [fieldSlug, setFieldSlug] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [saving, setSaving] = useState(false);

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
      await apiClient(`/content-types/${id}/fields`, {
        token: getAuthToken() ?? undefined,
        method: "POST",
        body: JSON.stringify({
          name: fieldName,
          slug: fieldSlug,
          type: fieldType,
          required,
        }),
      });
      setFieldName("");
      setFieldSlug("");
      setFieldType("TEXT");
      setRequired(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Alan eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock title="İçerik tipi detayı yükleniyor..." />;
  if (error) return <ErrorBlock title="İstek başarısız" description={error} action={<button className="ui-control rounded-md border border-(--line) px-3 py-1.5 text-xs text-slate-100" onClick={() => void load()}>Tekrar dene</button>} />;
  if (!contentType) return <EmptyBlock title="İçerik tipi bulunamadı" description="İstenen şema mevcut değil veya erişim izniniz yok." />;

  return (
    <section className="page-card ui-elevate">
      <p className="page-kicker">Şema Detayı</p>
      <h1 className="page-title">{contentType.name}</h1>
      <p className="page-subtitle">{contentType.description || "Açıklama girilmemiş."}</p>

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
        <EmptyBlock title="Henüz alan yok" description="Bu içerik tipinde dinamik kayıt render etmek için alan ekleyin." />
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
