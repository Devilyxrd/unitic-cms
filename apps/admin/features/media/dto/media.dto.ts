import type { Id } from "@/shared/types/core";

export type MediaItemDto = {
  id: Id;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};
