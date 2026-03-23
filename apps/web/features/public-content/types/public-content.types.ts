import type {
  PublicAllPublishedGroupDto,
  PublicAllPublishedResponseDto,
  PublicContentTypeSummaryDto,
  PublicEntryDto,
  PublicEntryValueDto,
  PublicFieldDto,
  PublicListResponseDto,
  PublicMediaDto,
} from "@/features/public-content/dto/public-content.dto";

export type PublicField = PublicFieldDto;
export type PublicMedia = PublicMediaDto;
export type PublicEntryValue = PublicEntryValueDto;
export type PublicEntry = PublicEntryDto;
export type PublicListResponse<T> = PublicListResponseDto<T>;
export type PublicContentTypeSummary = PublicContentTypeSummaryDto;
export type PublicAllPublishedGroup = PublicAllPublishedGroupDto;
export type PublicAllPublishedResponse = PublicAllPublishedResponseDto;
