import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateContentTypeDto {
  @ApiProperty({ example: 'Blog Yazısı', description: 'İçerik tipi adı.' })
  @IsString({ message: 'Ad metin olmalıdır.' })
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır.' })
  name!: string;

  @ApiProperty({
    example: 'blog-yazisi',
    description: 'URL için kısa ad (slug).',
  })
  @IsString({ message: 'Slug metin olmalıdır.' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug sadece küçük harf, rakam ve tire içerebilir.',
  })
  slug!: string;

  @ApiPropertyOptional({
    example: 'Blog içerikleri için şema.',
    description: 'Kısa açıklama (opsiyonel).',
  })
  @IsOptional()
  @IsString({ message: 'Açıklama metin olmalıdır.' })
  description?: string;
}
