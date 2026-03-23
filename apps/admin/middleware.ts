import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, PROTECTED_ROUTE_PREFIXES, PUBLIC_ROUTES, ROUTES } from "@/constants/routes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function hasValidSession(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!authToken && isProtectedRoute) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (authToken && (isPublicRoute || isProtectedRoute)) {
    const validSession = await hasValidSession(authToken);

    if (!validSession) {
      if (isProtectedRoute) {
        const loginUrl = new URL(ROUTES.login, request.url);
        loginUrl.searchParams.set("next", `${pathname}${search}`);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete(AUTH_COOKIE_NAME);
        return response;
      }

      const response = NextResponse.next();
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    if (isPublicRoute) {
      return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
