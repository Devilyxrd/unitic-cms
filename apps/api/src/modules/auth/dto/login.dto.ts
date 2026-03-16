import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin.' })
  email!: string;

  @IsString({ message: 'Şifre metin olmalıdır.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password!: string;
}
