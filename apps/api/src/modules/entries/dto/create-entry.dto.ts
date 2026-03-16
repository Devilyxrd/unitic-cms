import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'field-uuid', description: 'Alan kimliği.' })
  @IsString({ message: 'fieldId metin olmalıdır.' })
  fieldId!: string;

  @ApiPropertyOptional({
    example: 'Merhaba dünya',
    description: 'Alan değeri (metin/sayı/tarih vb.).',
  })
  @IsOptional()
  value?: unknown;

  @ApiPropertyOptional({
    example: 'media-uuid',
    description: 'Medya alanı için medya kimliği.',
  })
  @IsOptional()
  @IsString({ message: 'mediaId metin olmalıdır.' })
  mediaId?: string | null;
}

export class CreateEntryDto {
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

  @ApiProperty({
    enum: EntryStatus,
    example: 'DRAFT',
    description: 'Kayıt durumu.',
  })
  @IsEnum(EntryStatus, { message: 'Durum değeri geçersiz.' })
  status!: EntryStatus;

  @ApiProperty({ type: [EntryValueDto], description: 'Kayıt alan değerleri.' })
  @IsArray({ message: 'values alanı dizi olmalıdır.' })
  @ValidateNested({ each: true })
  @Type(() => EntryValueDto)
  values!: EntryValueDto[];
}
