// @ts-nocheck
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  const prismaMock = {
    user: {
      create: jest.fn(),
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

  it('registers editor user and returns session payload', async () => {
    hash.mockResolvedValue('hashed-password');
    prismaMock.user.create.mockResolvedValue({
      id: 'user-2',
      email: 'editor@unitic.dev',
      username: 'editor',
      role: Role.EDITOR,
    });
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

    const result = await authService.register({
      email: 'editor@unitic.dev',
      username: 'editor',
      password: 'Editor123!',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'editor@unitic.dev',
        username: 'editor',
        password: 'hashed-password',
        role: Role.EDITOR,
      },
    });
    expect(result).toEqual({
      token: 'jwt-token',
      user: {
        id: 'user-2',
        email: 'editor@unitic.dev',
        username: 'editor',
        role: Role.EDITOR,
      },
    });
  });

  it('throws conflict for duplicate registration data', async () => {
    hash.mockResolvedValue('hashed-password');
    prismaMock.user.create.mockRejectedValue({
      code: 'P2002',
      constructor: { name: 'PrismaClientKnownRequestError' },
    });

    await expect(
      authService.register({
        email: 'editor@unitic.dev',
        username: 'editor',
        password: 'Editor123!',
      }),
    ).rejects.toThrow(new ConflictException('E-posta veya kullanıcı adı zaten kullanımda.'));
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
