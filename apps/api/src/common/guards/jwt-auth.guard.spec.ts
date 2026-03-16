// @ts-nocheck
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const reflectorMock = {
    getAllAndOverride: jest.fn(),
  };

  const jwtServiceMock = {
    verify: jest.fn(),
  };

  const guard = new JwtAuthGuard(reflectorMock, jwtServiceMock);

  const createContext = (request) =>
    ({
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    });

  beforeEach(() => {
    jest.clearAllMocks();
    reflectorMock.getAllAndOverride.mockReturnValue(false);
  });

  it('allows public routes', () => {
    reflectorMock.getAllAndOverride.mockReturnValue(true);

    const canActivate = guard.canActivate(createContext({}));

    expect(canActivate).toBe(true);
    expect(jwtServiceMock.verify).not.toHaveBeenCalled();
  });

  it('accepts bearer token from authorization header', () => {
    jwtServiceMock.verify.mockReturnValue({
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
    expect(jwtServiceMock.verify).toHaveBeenCalledWith('token-value', {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    });
  });

  it('accepts token from cookie when header does not exist', () => {
    jwtServiceMock.verify.mockReturnValue({
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
    expect(jwtServiceMock.verify).toHaveBeenCalledWith('cookie-token', {
      secret: process.env.JWT_SECRET ?? 'dev-secret',
    });
  });

  it('throws unauthorized when no token is provided', () => {
    expect(() => guard.canActivate(createContext({ headers: {} }))).toThrow(
      new UnauthorizedException('Kimlik dogrulama gerekli.'),
    );
  });
});
