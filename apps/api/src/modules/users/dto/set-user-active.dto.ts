import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetUserActiveDto {
  @ApiProperty({ example: true, description: 'Kullanıcının aktiflik durumu.' })
  @IsBoolean({ message: 'active alanı boolean olmalıdır.' })
  active!: boolean;
}
