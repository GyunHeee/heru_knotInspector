export const ADMIN_USERNAME = "admin"
export const ADMIN_PASSWORD = "admin1234!"
export const ADMIN_SESSION_COOKIE = "knot_admin_session"
export const ADMIN_SESSION_VALUE = "authenticated"

export function isAdminAuthenticatedFromCookie(cookieValue?: string | null) {
  return cookieValue === ADMIN_SESSION_VALUE
}
