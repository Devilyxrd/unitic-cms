import { ApiPropertyOptional } from '@nestjs/swagger';
import { FieldType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateContentFieldDto {
  @ApiPropertyOptional({ example: 'Başlık', description: 'Alan adı.' })
  @IsOptional()
  @IsString({ message: 'Alan adı metin olmalıdır.' })
  name?: string;

  @ApiPropertyOptional({
    example: 'baslik',
    description: 'Alan slug (URL için kısa ad).',
  })
  @IsOptional()
  @IsString({ message: 'Alan slug metin olmalıdır.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Alan slug sadece küçük harf, rakam ve tire içerebilir.',
  })
  slug?: string;

  @ApiPropertyOptional({
    enum: FieldType,
    example: 'TEXT',
    description: 'Alan tipi.',
  })
  @IsOptional()
  @IsEnum(FieldType, { message: 'Alan tipi geçersiz.' })
  type?: FieldType;

  @ApiPropertyOptional({ example: true, description: 'Zorunlu alan mı?' })
  @IsOptional()
  @IsBoolean({ message: 'required alanı boolean olmalıdır.' })
  required?: boolean;
}
