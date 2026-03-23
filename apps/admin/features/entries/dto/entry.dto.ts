import type { EntryStatus, Id } from "@/shared/types/core";

export type EntryValueDto = {
  fieldId: Id;
  value?: unknown;
  mediaId?: Id | null;
};

export type EntryDto = {
  id: Id;
  slug?: string | null;
  status: EntryStatus;
  contentTypeId: Id;
  authorId?: Id | null;
  publishedAt?: string | null;
  values: EntryValueDto[];
  createdAt: string;
  updatedAt: string;
};

export type CreateEntryPayloadDto = {
  slug?: string;
  status: EntryStatus;
  values: EntryValueDto[];
};

export type UpdateEntryPayloadDto = {
  slug?: string;
  status?: EntryStatus;
  values?: EntryValueDto[];
};
