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
import { EntryValueDto } from './create-entry.dto';

export class UpdateEntryDto {
  @IsOptional()
  @IsString({ message: 'Slug metin olmalıdır.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug sadece küçük harf, rakam ve tire içerebilir.',
  })
  slug?: string;

  @IsOptional()
  @IsEnum(EntryStatus, { message: 'Durum değeri geçersiz.' })
  status?: EntryStatus;

  @IsOptional()
  @IsArray({ message: 'values alanı dizi olmalıdır.' })
  @ValidateNested({ each: true })
  @Type(() => EntryValueDto)
  values?: EntryValueDto[];
}