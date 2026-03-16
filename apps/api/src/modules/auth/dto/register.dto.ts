import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'ornek@domain.com',
    description: 'Kullanıcı e-posta adresi.',
  })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi girin.' })
  email!: string;

  @ApiProperty({
    example: 'ornekkullanici',
    description: 'Kullanıcı adı (en az 3 karakter).',
  })
  @IsString({ message: 'Kullanıcı adı metin olmalıdır.' })
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' })
  username!: string;

  @ApiProperty({
    example: 'Sifre123!',
    description:
      'En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.',
  })
  @IsString({ message: 'Şifre metin olmalıdır.' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Şifre en az 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.',
  })
  password!: string;
}
