export const ADMIN_SESSION_CHANGED_EVENT = "admin-session-changed"

export function dispatchAdminSessionChangedEvent() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGED_EVENT))
}
