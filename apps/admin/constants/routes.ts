export const ROUTES = {
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  contentTypes: "/contentTypes",
  media: "/media",
  users: "/users",
} as const;

export const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: "Kontrol Paneli" },
  { href: ROUTES.contentTypes, label: "İçerik Tipleri" },
  { href: ROUTES.media, label: "Medya" },
  { href: ROUTES.users, label: "Kullanıcılar" },
] as const;

export const AUTH_COOKIE_NAME = "admin_token";

export const PUBLIC_ROUTES = [ROUTES.login, ROUTES.register] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.contentTypes,
  "/entries",
  ROUTES.media,
  ROUTES.users,
] as const;
