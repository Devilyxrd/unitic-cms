import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthUser } from '../../common/types/auth-user';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@ApiTags('Kimlik Dogrulama')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Kullanici girisi',
    description: 'E-posta ve sifre ile giris yapar, JWT token dondurur.',
  })
  @ApiOkResponse({ description: 'Giris basarili.' })
  @ApiUnauthorizedResponse({ description: 'E-posta veya sifre hatali.' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Aktif kullanici bilgisi',
    description: 'JWT token ile giris yapan kullanicinin profilini getirir.',
  })
  @ApiOkResponse({ description: 'Kullanici bilgisi donduruldu.' })
  @ApiUnauthorizedResponse({ description: 'Token gecersiz veya sure dolmus.' })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
