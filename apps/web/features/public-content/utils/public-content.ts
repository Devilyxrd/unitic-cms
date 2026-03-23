import type { FieldType } from "@/features/public-content/dto/public-content.dto";
import type { PublicEntry } from "@/features/public-content/types/public-content.types";

const TITLE_CANDIDATES = ["title", "baslik", "basligi", "heading", "headline"];

export function formatPublishedDate(value?: string | null) {
  if (!value) return "Yayin tarihi yok";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Yayin tarihi yok"
    : date.toLocaleDateString("tr-TR", { dateStyle: "medium" });
}

export function getEntryTitle(entry: PublicEntry) {
  const titleLike = entry.values.find(
    (item) =>
      item.field.slug.toLowerCase() === "title" ||
      item.field.name.toLowerCase().includes("baslik") ||
      item.field.name.toLowerCase().includes("title"),
  );

  if (typeof titleLike?.value === "string" && titleLike.value.trim()) {
    return titleLike.value;
  }

  const firstText = entry.values.find(
    (item) => item.field.type === "TEXT" || item.field.type === "RICHTEXT",
  );

  if (typeof firstText?.value === "string" && firstText.value.trim()) {
    return firstText.value;
  }

  return entry.slug ?? entry.id;
}

export function getEntryExcerpt(entry: PublicEntry) {
  const rich = entry.values.find((item) => item.field.type === "RICHTEXT");
  const text = entry.values.find((item) => item.field.type === "TEXT");
  const raw =
    (typeof rich?.value === "string" ? rich.value : null) ??
    (typeof text?.value === "string" ? text.value : "");
  const cleaned = raw.replace(/\s+/g, " ").trim();

  if (!cleaned) return "Bu icerik icin kisa aciklama bulunamadi.";
  return cleaned.length > 160 ? `${cleaned.slice(0, 160)}...` : cleaned;
}

export function formatFieldValue(fieldType: FieldType, value: unknown) {
  if (fieldType === "BOOLEAN") {
    return value ? "Evet" : "Hayir";
  }

  if (fieldType === "DATE" && typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("tr-TR", { dateStyle: "medium" });
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("tr-TR").format(value);
  }

  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "-";
  }

  return JSON.stringify(value);
}

function normalizeForMatch(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .trim();
}

export function getEntryDetailView(entry: PublicEntry) {
  const sortedValues = [...entry.values].sort((a, b) => a.field.order - b.field.order);
  const titleFieldValue = sortedValues.find((item) => {
    if (typeof item.value !== "string" || item.value.trim().length === 0) {
      return false;
    }

    const normalizedSlug = normalizeForMatch(item.field.slug);
    const normalizedName = normalizeForMatch(item.field.name);

    return TITLE_CANDIDATES.some(
      (candidate) =>
        normalizedSlug === candidate ||
        normalizedSlug.includes(candidate) ||
        normalizedName.includes(candidate),
    );
  });

  const firstTextValue = sortedValues.find(
    (item) =>
      (item.field.type === "TEXT" || item.field.type === "RICHTEXT") &&
      typeof item.value === "string" &&
      item.value.trim().length > 0,
  );

  const pageTitle =
    typeof titleFieldValue?.value === "string" && titleFieldValue.value.trim().length > 0
      ? titleFieldValue.value
      : typeof firstTextValue?.value === "string" && firstTextValue.value.trim().length > 0
        ? firstTextValue.value
        : "Icerik Detayi";

  const leadImage = sortedValues.find(
    (item) => item.field.type === "MEDIA" && item.media?.mimeType.startsWith("image/"),
  )?.media;

  const textBlocks = sortedValues.filter(
    (item) =>
      item.id !== titleFieldValue?.id &&
      (item.field.type === "TEXT" || item.field.type === "RICHTEXT") &&
      typeof item.value === "string" &&
      item.value.trim().length > 0,
  );

  const fallbackBlocks = sortedValues.filter(
    (item) => item.field.type !== "MEDIA" && item.field.type !== "TEXT" && item.field.type !== "RICHTEXT",
  );

  return {
    fallbackBlocks,
    leadImage,
    pageTitle,
    sortedValues,
    textBlocks,
  };
}
