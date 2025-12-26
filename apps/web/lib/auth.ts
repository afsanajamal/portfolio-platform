export type UserRole = "admin" | "editor" | "viewer";


const ACCESS_TOKEN_KEY = "pp_access_token";
const ROLE_KEY = "pp_role";
const ORG_KEY = "pp_org_id";
const USER_ID_KEY = "pp_user_id";
const REFRESH_TOKEN_KEY = "pp_refresh_token";

function emitAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("pp-auth-changed"));
}

export function setAuth(
  accessToken: string,
  refreshToken: string,
  role: UserRole,
  orgId?: string | null,
  userId?: number | null
) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(ROLE_KEY, role);

  if (orgId) localStorage.setItem(ORG_KEY, String(orgId));
  else localStorage.removeItem(ORG_KEY);

  if (userId != null) localStorage.setItem(USER_ID_KEY, String(userId));
  else localStorage.removeItem(USER_ID_KEY);

  emitAuthChanged();
}

export function getRefreshToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_TOKEN_KEY);
}
export function getUserId(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(USER_ID_KEY);
  return v ? Number(v) : null;
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(ORG_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  emitAuthChanged();
}

export function getAccessToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRole(): UserRole | null {
  const v = typeof window === "undefined" ? null : localStorage.getItem(ROLE_KEY);
  // Ensure we don't return "null" string etc.
  if (!v) return null;
  return v as UserRole;
}

export function isAuthed(): boolean {
  return !!getAccessToken();
}

export function getOrgId(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(ORG_KEY);
}
