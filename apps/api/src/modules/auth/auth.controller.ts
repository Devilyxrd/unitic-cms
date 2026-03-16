import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthUser } from '../../common/types/auth-user';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@ApiTags('Kimlik Dogrulama')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24,
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Kullanici girisi',
    description: 'E-posta ve sifre ile giris yapar, HttpOnly oturum cerezini yazar.',
  })
  @ApiOkResponse({ description: 'Giris basarili.' })
  @ApiUnauthorizedResponse({ description: 'E-posta veya sifre hatali.' })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body.email, body.password);

    res.cookie('admin_token', result.token, this.getCookieOptions());

    return {
      ok: true,
      user: result.user,
    };
  }

  @Public()
  @Post('logout')
  @ApiOperation({
    summary: 'Kullanici cikisi',
    description: 'HttpOnly oturum cerezini temizler.',
  })
  @ApiOkResponse({ description: 'Cikis basarili.' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('admin_token', this.getCookieOptions());
    return { ok: true };
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
