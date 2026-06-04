const USER_ID_KEY = "grasp_user_id";

/** Stable anonymous id until Supabase Auth is wired; then replace with auth session user id */
export function getOrCreateLocalUserId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(USER_ID_KEY, id);
  return id;
}

export function getLocalUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_ID_KEY);
}

export function setLocalUserId(userId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_ID_KEY, userId);
}

export function clearLocalUserId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_ID_KEY);
}

const USER_EMAIL_KEY = "grasp_user_email";

export function setLocalUserEmail(email: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_EMAIL_KEY, email);
}

export function getLocalUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_EMAIL_KEY);
}

export function clearLocalUserEmail(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_EMAIL_KEY);
}
