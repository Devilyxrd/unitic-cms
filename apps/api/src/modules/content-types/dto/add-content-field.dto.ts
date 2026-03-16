import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FieldType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class AddContentFieldDto {
  @ApiProperty({ example: 'Başlık', description: 'Alan adı.' })
  @IsString({ message: 'Alan adı metin olmalıdır.' })
  name!: string;

  @ApiProperty({
    example: 'baslik',
    description: 'Alan slug (URL için kısa ad).',
  })
  @IsString({ message: 'Alan slug metin olmalıdır.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Alan slug sadece küçük harf, rakam ve tire içerebilir.',
  })
  slug!: string;

  @ApiProperty({ enum: FieldType, example: 'TEXT', description: 'Alan tipi.' })
  @IsEnum(FieldType, { message: 'Alan tipi geçersiz.' })
  type!: FieldType;

  @ApiPropertyOptional({ example: true, description: 'Zorunlu alan mı?' })
  @IsOptional()
  @IsBoolean({ message: 'required alanı boolean olmalıdır.' })
  required?: boolean;
}
