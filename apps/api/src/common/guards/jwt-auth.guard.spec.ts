import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtAuthGuard', () => {
  const getAllAndOverride = jest.fn<
    boolean | undefined,
    [unknown, unknown[]]
  >();
  const reflectorMock: Pick<Reflector, 'getAllAndOverride'> = {
    getAllAndOverride,
  };

  const verify = jest.fn();
  const jwtServiceMock: Pick<JwtService, 'verify'> = {
    verify: verify as JwtService['verify'],
  };

  const findUnique = jest.fn();
  const prismaMock = {
    user: {
      findUnique,
    },
  } as unknown as PrismaService;

  const guard = new JwtAuthGuard(
    reflectorMock as Reflector,
    jwtServiceMock as JwtService,
    prismaMock,
  );

  const createContext = (request: {
    headers?: { authorization?: string };
    cookies?: Record<string, string | undefined>;
    user?: unknown;
  }): ExecutionContext =>
    ({
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    getAllAndOverride.mockReturnValue(false);
    findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@unitic.dev',
      role: Role.ADMIN,
      isActive: true,
    });
  });

  it('allows public routes', async () => {
    getAllAndOverride.mockReturnValue(true);

    const canActivate = await guard.canActivate(createContext({}));

    expect(canActivate).toBe(true);
    expect(jwtServiceMock.verify).not.toHaveBeenCalled();
  });

  it('accepts bearer token from authorization header', async () => {
    verify.mockReturnValue({
      id: 'user-1',
      email: 'admin@unitic.dev',
      role: Role.ADMIN,
    });

    const request = {
      headers: {
        authorization: 'Bearer token-value',
      },
    };

    const canActivate = await guard.canActivate(createContext(request));

    expect(canActivate).toBe(true);
    expect(verify).toHaveBeenCalledWith('token-value', {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    });
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  });

  it('accepts token from cookie when header does not exist', async () => {
    verify.mockReturnValue({
      id: 'user-2',
      email: 'editor@unitic.dev',
      role: Role.EDITOR,
    });

    const request = {
      headers: {},
      cookies: {
        admin_token: 'cookie-token',
      },
    };

    const canActivate = await guard.canActivate(createContext(request));

    expect(canActivate).toBe(true);
    expect(verify).toHaveBeenCalledWith('cookie-token', {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    });
  });

  it('throws unauthorized when no token is provided', async () => {
    await expect(
      guard.canActivate(createContext({ headers: {} })),
    ).rejects.toThrow(new UnauthorizedException('Kimlik dogrulama gerekli.'));
  });

  it('throws unauthorized when token user no longer exists', async () => {
    verify.mockReturnValue({
      id: 'deleted-user',
      email: 'deleted@unitic.dev',
      role: Role.ADMIN,
    });
    findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createContext({
          headers: {
            authorization: 'Bearer token-value',
          },
        }),
      ),
    ).rejects.toThrow(
      new UnauthorizedException('Oturum gecersiz veya suresi dolmus.'),
    );
  });
});
