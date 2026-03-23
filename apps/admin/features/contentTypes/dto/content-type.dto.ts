import type { FieldType, Id } from "@/shared/types/core";

export type ContentFieldDto = {
  id: Id;
  name: string;
  slug: string;
  type: FieldType;
  required: boolean;
  order: number;
};

export type ContentTypeDto = {
  id: Id;
  name: string;
  slug: string;
  description?: string | null;
  fields: ContentFieldDto[];
  createdAt: string;
  updatedAt: string;
};

export type CreateContentTypePayloadDto = {
  name: string;
  slug: string;
  description?: string;
};

export type UpdateContentTypePayloadDto = {
  name?: string;
  slug?: string;
  description?: string;
};

export type UpdateContentFieldPayloadDto = {
  name?: string;
  slug?: string;
  type?: FieldType;
  required?: boolean;
};

export type CreateContentFieldPayloadDto = {
  name: string;
  slug: string;
  type: FieldType;
  required?: boolean;
};
