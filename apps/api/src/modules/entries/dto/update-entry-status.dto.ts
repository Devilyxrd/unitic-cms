import { ApiProperty } from '@nestjs/swagger';
import { EntryStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateEntryStatusDto {
  @ApiProperty({
    enum: EntryStatus,
    example: 'PUBLISHED',
    description: 'Yeni kayıt durumu.',
  })
  @IsEnum(EntryStatus, { message: 'Durum değeri geçersiz.' })
  status!: EntryStatus;
}
