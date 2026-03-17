import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../constants/auth';
import { AuthUser } from '../types/auth-user';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      cookies?: Record<string, string | undefined>;
      user?: AuthUser;
    }>();

    const authHeader = request.headers.authorization;
    const headerToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : null;

    const cookieToken = request.cookies?.admin_token?.trim() ?? null;
    const token = headerToken || cookieToken;

    if (!token) {
      throw new UnauthorizedException('Kimlik dogrulama gerekli.');
    }

    try {
      const payload = this.jwtService.verify<AuthUser>(token, {
        secret: process.env.JWT_SECRET ?? 'dev-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive || user.role === Role.USER) {
        throw new UnauthorizedException('Oturum gecersiz veya suresi dolmus.');
      }

      request.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Oturum gecersiz veya suresi dolmus.');
    }
  }
}
