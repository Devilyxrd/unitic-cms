import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    example: 'blog-yazisi-1',
    description: 'URL için kısa ad (slug).',
  })
  @IsOptional()
  @IsString({ message: 'Slug metin olmalıdır.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug sadece küçük harf, rakam ve tire içerebilir.',
  })
  slug?: string;

  @ApiPropertyOptional({
    enum: EntryStatus,
    example: 'PUBLISHED',
    description: 'Kayıt durumu.',
  })
  @IsOptional()
  @IsEnum(EntryStatus, { message: 'Durum değeri geçersiz.' })
  status?: EntryStatus;

  @ApiPropertyOptional({
    type: [EntryValueDto],
    description: 'Kayıt alan değerleri.',
  })
  @IsOptional()
  @IsArray({ message: 'values alanı dizi olmalıdır.' })
  @ValidateNested({ each: true })
  @Type(() => EntryValueDto)
  values?: EntryValueDto[];
}
