import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta girin.' })
  email!: string;

  @IsString({ message: 'Kullanıcı adı metin olmalıdır.' })
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' })
  username!: string;

  @IsString({ message: 'Şifre metin olmalıdır.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password!: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rol değeri geçersiz.' })
  role?: Role;
}
