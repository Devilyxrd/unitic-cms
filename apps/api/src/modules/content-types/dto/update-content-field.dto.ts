import { FieldType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateContentFieldDto {
  @IsOptional()
  @IsString({ message: 'Alan adı metin olmalıdır.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Alan slug metin olmalıdır.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Alan slug sadece küçük harf, rakam ve tire içerebilir.',
  })
  slug?: string;

  @IsOptional()
  @IsEnum(FieldType, { message: 'Alan tipi geçersiz.' })
  type?: FieldType;

  @IsOptional()
  @IsBoolean({ message: 'required alanı boolean olmalıdır.' })
  required?: boolean;
}