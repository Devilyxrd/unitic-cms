// @ts-nocheck
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { compare } from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const authService = new AuthService(prismaMock, jwtServiceMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns token and user for valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@unitic.dev',
      username: 'admin',
      password: 'hashed-password',
      role: Role.ADMIN,
      isActive: true,
    });
    compare.mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token');
    prismaMock.user.update.mockResolvedValue(undefined);

    const result = await authService.login('admin@unitic.dev', 'Admin123!');

    expect(result).toEqual({
      token: 'jwt-token',
      user: {
        id: 'user-1',
        email: 'admin@unitic.dev',
        username: 'admin',
        role: Role.ADMIN,
      },
    });
  });

  it('throws unauthorized for inactive user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@unitic.dev',
      username: 'admin',
      password: 'hashed-password',
      role: Role.ADMIN,
      isActive: false,
    });

    await expect(authService.login('admin@unitic.dev', 'Admin123!')).rejects.toThrow(
      new UnauthorizedException('Kullanıcı hesabı pasif durumda.'),
    );
  });

  it('throws unauthorized for wrong password', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@unitic.dev',
      username: 'admin',
      password: 'hashed-password',
      role: Role.ADMIN,
      isActive: true,
    });
    compare.mockResolvedValue(false);

    await expect(authService.login('admin@unitic.dev', 'wrong')).rejects.toThrow(
      new UnauthorizedException('E-posta veya şifre hatalı.'),
    );
  });
});
