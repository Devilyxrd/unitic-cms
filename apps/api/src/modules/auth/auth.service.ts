import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { getAuthTokenTtlSeconds } from '../../common/constants/auth';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../../common/types/auth-user';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterDto) {
    const passwordHash = await hash(payload.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: payload.email,
          username: payload.username,
          password: passwordHash,
          role: Role.USER,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      if (this.isPrismaKnownError(error, 'P2002')) {
        throw new ConflictException(
          'E-posta veya kullanıcı adı zaten kullanımda.',
        );
      }

      throw error;
    }
  }

  private isPrismaKnownError(error: unknown, code: string) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      (typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === code)
    );
  }

  async login(email: string, password: string) {
    const normalizedEmail = (email ?? '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    const user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Kullanıcı hesabı pasif durumda.');
    }

    if (user.role === Role.USER) {
      throw new UnauthorizedException(
        'Bu panel yalnızca admin ve editör kullanıcıları içindir.',
      );
    }

    const passwordOk = await compare(password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedException('E-posta veya şifre hatalı.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueSession(user.id, user.email, user.username, user.role);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı.');
    }

    return user;
  }

  private async issueSession(
    id: string,
    email: string,
    username: string,
    role: Role,
  ) {
    const payload: AuthUser = {
      id,
      email,
      role,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: getAuthTokenTtlSeconds(),
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    });

    return {
      token,
      user: {
        id,
        email,
        username,
        role,
      },
    };
  }
}
