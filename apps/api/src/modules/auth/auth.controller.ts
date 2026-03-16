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
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@ApiTags('Kimlik Doğrulama')
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
  @Post('register')
  @ApiOperation({
    summary: 'Kullanıcı kaydı',
    description:
      'Yeni bir USER kullanıcısı oluşturur. Admin paneli girişi için rol ataması gerekir.',
  })
  @ApiOkResponse({ description: 'Kayıt başarılı.' })
  async register(@Body() body: RegisterDto) {
    const result = await this.authService.register(body);

    return {
      ok: true,
      user: result.user,
      message:
        'Kayıt oluşturuldu. Admin paneline erişim için rol ataması gerekir.',
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Kullanıcı girişi',
    description:
      'E-posta ve şifre ile giriş yapar, HttpOnly oturum çerezini yazar.',
  })
  @ApiOkResponse({ description: 'Giriş başarılı.' })
  @ApiUnauthorizedResponse({ description: 'E-posta veya şifre hatalı.' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
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
    summary: 'Kullanıcı çıkışı',
    description: 'HttpOnly oturum çerezini temizler.',
  })
  @ApiOkResponse({ description: 'Çıkış başarılı.' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('admin_token', this.getCookieOptions());
    return { ok: true };
  }

  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Aktif kullanıcı bilgisi',
    description: 'JWT token ile giriş yapan kullanıcının profilini getirir.',
  })
  @ApiOkResponse({ description: 'Kullanıcı bilgisi döndürüldü.' })
  @ApiUnauthorizedResponse({ description: 'Token geçersiz veya süre dolmuş.' })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
