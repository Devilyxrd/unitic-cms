export type Id = string;

export type Role = "ADMIN" | "EDITOR" | "USER";

export type EntryStatus = "DRAFT" | "PUBLISHED";

export type FieldType =
  | "TEXT"
  | "RICHTEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "MEDIA";

export type ApiListResponse<T> = {
  data: T[];
  total?: number;
};
