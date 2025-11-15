// filepath: /home/saransh/WebstormProjects/Cgangafrontend/src/lib/auth.ts

// Small authentication/role helpers for the frontend.
// Sources of truth (in order):
// - explicit `role` stored in localStorage (convenient during dev)
// - JWT token payload stored as `token` in localStorage (if backend will provide role there)

export function getToken(): string | null {
  return localStorage.getItem("token");
}

function tryDecodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url -> base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // atob is available in browsers
    const json = atob(b64);
    // Some JWT implementations produce unicode; decode safely
    try {
      return JSON.parse(decodeURIComponent(escape(json))) as Record<string, unknown>;
    } catch {
      return JSON.parse(json) as Record<string, unknown>;
    }
  } catch {
    return null;
  }
}

export function getUserRole(): string | null {
  const explicit = localStorage.getItem("role");
  if (explicit) return explicit;

  const token = getToken();
  if (!token) return null;
  const payload = tryDecodeJwt(token);
  if (!payload) return null;

  // Common fields where role might be found
  if (typeof payload.role === "string") return payload.role;
  if (Array.isArray(payload.roles) && payload.roles.length) return payload.roles[0];
  if (payload.user && typeof payload.user.role === "string") return payload.user.role;

  return null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  const role = getUserRole();
  if (!role) return false;
  const r = role.toLowerCase();
  return r === "admin" || r === "administrator" || r === "superadmin";
}
