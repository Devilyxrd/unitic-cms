export type FieldType =
  | "TEXT"
  | "RICHTEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "MEDIA";

export type PublicFieldDto = {
  id: string;
  name: string;
  slug: string;
  type: FieldType;
  required: boolean;
  order: number;
};

export type PublicMediaDto = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
};

export type PublicEntryValueDto = {
  id: string;
  value: unknown;
  fieldId: string;
  mediaId?: string | null;
  field: PublicFieldDto;
  media?: PublicMediaDto | null;
};

export type PublicEntryDto = {
  id: string;
  slug: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  values: PublicEntryValueDto[];
};

export type PublicListResponseDto<T> = {
  data: T[];
  total: number;
};

export type PublicContentTypeSummaryDto = {
  id: string;
  name: string;
  slug: string;
  totalPublishedEntries: number;
};

export type PublicAllPublishedGroupDto = {
  contentType: {
    id: string;
    name: string;
    slug: string;
  };
  entries: PublicEntryDto[];
  totalPublishedEntries: number;
};

export type PublicAllPublishedResponseDto = {
  data: PublicAllPublishedGroupDto[];
  totalContentTypes: number;
  totalEntries: number;
};
