const KEY = "starlink_auth_v1";
const USER_KEY = "starlink_user_email";

const STATIC_USERNAME = "admin";
const STATIC_PASSWORD = "123";

export async function login(username: string, password: string): Promise<void> {
  if (username.trim() !== STATIC_USERNAME || password !== STATIC_PASSWORD) {
    throw new Error("Invalid username or password");
  }
  localStorage.setItem(KEY, "1");
  localStorage.setItem(USER_KEY, STATIC_USERNAME);
  window.dispatchEvent(new Event("starlink:auth-changed"));
}

export async function logout(): Promise<void> {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("starlink:auth-changed"));
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function currentUserEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_KEY) ?? "";
}
