import { EntryStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EntryValueDto {
  @IsString({ message: 'fieldId metin olmalıdır.' })
  fieldId!: string;

  @IsOptional()
  value?: unknown;

  @IsOptional()
  @IsString({ message: 'mediaId metin olmalıdır.' })
  mediaId?: string | null;
}

export class CreateEntryDto {
  @IsOptional()
  @IsString({ message: 'Slug metin olmalıdır.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug sadece küçük harf, rakam ve tire içerebilir.',
  })
  slug?: string;

  @IsEnum(EntryStatus, { message: 'Durum değeri geçersiz.' })
  status!: EntryStatus;

  @IsArray({ message: 'values alanı dizi olmalıdır.' })
  @ValidateNested({ each: true })
  @Type(() => EntryValueDto)
  values!: EntryValueDto[];
}
