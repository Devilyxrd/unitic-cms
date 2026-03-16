import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const getAllAndOverride = jest.fn<
    boolean | undefined,
    [unknown, unknown[]]
  >();
  const reflectorMock: Pick<Reflector, 'getAllAndOverride'> = {
    getAllAndOverride,
  };

  const verify = jest.fn<
    ReturnType<JwtService['verify']>,
    Parameters<JwtService['verify']>
  >();
  const jwtServiceMock: Pick<JwtService, 'verify'> = {
    verify,
  };

  const guard = new JwtAuthGuard(
    reflectorMock as Reflector,
    jwtServiceMock as JwtService,
  );

  const createContext = (request: {
    headers: { authorization?: string };
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
  });

  it('allows public routes', () => {
    getAllAndOverride.mockReturnValue(true);

    const canActivate = guard.canActivate(createContext({}));

    expect(canActivate).toBe(true);
    expect(jwtServiceMock.verify).not.toHaveBeenCalled();
  });

  it('accepts bearer token from authorization header', () => {
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

    const canActivate = guard.canActivate(createContext(request));

    expect(canActivate).toBe(true);
    expect(verify).toHaveBeenCalledWith('token-value', {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    });
  });

  it('accepts token from cookie when header does not exist', () => {
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

    const canActivate = guard.canActivate(createContext(request));

    expect(canActivate).toBe(true);
    expect(verify).toHaveBeenCalledWith('cookie-token', {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    });
  });

  it('throws unauthorized when no token is provided', () => {
    expect(() => guard.canActivate(createContext({ headers: {} }))).toThrow(
      new UnauthorizedException('Kimlik dogrulama gerekli.'),
    );
  });
});
