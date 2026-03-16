import { IsBoolean } from 'class-validator';

export class SetUserActiveDto {
  @IsBoolean({ message: 'active alanı boolean olmalıdır.' })
  active!: boolean;
}
