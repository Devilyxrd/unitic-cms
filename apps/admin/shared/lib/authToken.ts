import { AUTH_COOKIE_NAME } from "@/constants/routes";

export function getAuthToken() {
  if (typeof document === "undefined") {
    return null;
  }

  const tokenEntry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!tokenEntry) {
    return null;
  }

  return tokenEntry.split("=").slice(1).join("=");
}
