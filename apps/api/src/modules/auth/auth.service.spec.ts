import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { getAuthTokenTtlSeconds } from '../../common/constants/auth';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  const prismaMock = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const authService = new AuthService(
    prismaMock as unknown as { user: typeof prismaMock.user },
    jwtServiceMock as unknown as { signAsync: typeof jwtServiceMock.signAsync },
  );

  const compareMock = compare as jest.MockedFunction<typeof compare>;
  const hashMock = hash as jest.MockedFunction<typeof hash>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns token and user for valid credentials', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'admin@unitic.dev',
      username: 'admin',
      password: 'hashed-password',
      role: Role.ADMIN,
      isActive: true,
    });
    compareMock.mockResolvedValue(true);
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
    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
      {
        id: 'user-1',
        email: 'admin@unitic.dev',
        role: Role.ADMIN,
      },
      {
        expiresIn: getAuthTokenTtlSeconds(),
        secret: expect.any(String),
      },
    );
  });

  it('registers user with USER role and returns user payload', async () => {
    hashMock.mockResolvedValue('hashed-password');
    prismaMock.user.create.mockResolvedValue({
      id: 'user-2',
      email: 'editor@unitic.dev',
      username: 'editor',
      role: Role.USER,
    });

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
        role: Role.USER,
      },
    });
    expect(result).toEqual({
      user: {
        id: 'user-2',
        email: 'editor@unitic.dev',
        username: 'editor',
        role: Role.USER,
      },
    });
  });

  it('throws conflict for duplicate registration data', async () => {
    hashMock.mockResolvedValue('hashed-password');
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('conflict', {
        code: 'P2002',
        clientVersion: '7.5.0',
      }),
    );

    await expect(
      authService.register({
        email: 'editor@unitic.dev',
        username: 'editor',
        password: 'Editor123!',
      }),
    ).rejects.toThrow(
      new ConflictException('E-posta veya kullanıcı adı zaten kullanımda.'),
    );
  });

  it('throws unauthorized for inactive user', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'admin@unitic.dev',
      username: 'admin',
      password: 'hashed-password',
      role: Role.ADMIN,
      isActive: false,
    });

    await expect(
      authService.login('admin@unitic.dev', 'Admin123!'),
    ).rejects.toThrow(
      new UnauthorizedException('Kullanıcı hesabı pasif durumda.'),
    );
  });

  it('throws unauthorized for USER role', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user-3',
      email: 'user@unitic.dev',
      username: 'user',
      password: 'hashed-password',
      role: Role.USER,
      isActive: true,
    });

    await expect(
      authService.login('user@unitic.dev', 'User123!'),
    ).rejects.toThrow(
      new UnauthorizedException(
        'Bu panel yalnızca admin ve editör kullanıcıları içindir.',
      ),
    );
  });

  it('throws unauthorized for wrong password', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user-1',
      email: 'admin@unitic.dev',
      username: 'admin',
      password: 'hashed-password',
      role: Role.ADMIN,
      isActive: true,
    });
    compareMock.mockResolvedValue(false);

    await expect(
      authService.login('admin@unitic.dev', 'wrong'),
    ).rejects.toThrow(new UnauthorizedException('E-posta veya şifre hatalı.'));
  });
});
