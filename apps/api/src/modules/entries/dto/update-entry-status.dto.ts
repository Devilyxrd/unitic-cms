import { EntryStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateEntryStatusDto {
  @IsEnum(EntryStatus, { message: 'Durum değeri geçersiz.' })
  status!: EntryStatus;
}
