import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin.' })
  email!: string;

  @IsString({ message: 'Kullanıcı adı metin olmalıdır.' })
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' })
  username!: string;

  @IsString({ message: 'Şifre metin olmalıdır.' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır.' })
  password!: string;
}