export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  contentTypes: "/content-types",
  media: "/media",
  users: "/users",
} as const;

export const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: "Dashboard" },
  { href: ROUTES.contentTypes, label: "Content Types" },
  { href: ROUTES.media, label: "Media" },
  { href: ROUTES.users, label: "Users" },
] as const;

export const AUTH_COOKIE_NAME = "admin_token";

export const PUBLIC_ROUTES = [ROUTES.login] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.contentTypes,
  "/entries",
  ROUTES.media,
  ROUTES.users,
] as const;
