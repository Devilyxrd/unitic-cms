import { NextResponse } from "next/server";

export function middleware() {
  // Design mode: allow direct access to all routes without auth gating.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
