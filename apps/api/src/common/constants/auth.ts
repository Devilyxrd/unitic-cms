export const AUTH_COOKIE_NAME = 'admin_token';
export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

const DEFAULT_AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24;

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function getAuthTokenTtlSeconds() {
  return parsePositiveInteger(
    process.env.AUTH_TOKEN_TTL_SECONDS,
    DEFAULT_AUTH_TOKEN_TTL_SECONDS,
  );
}

export function getAuthTokenTtl() {
  return `${getAuthTokenTtlSeconds()}s`;
}

export function getAuthCookieMaxAgeMs() {
  return getAuthTokenTtlSeconds() * 1000;
}
