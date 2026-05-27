import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const KEY = "starlink_auth_v1";

// Mirror Firebase auth state into localStorage so synchronous isAuthed()
// works on first render (before Firebase restores the session).
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem(KEY, "1");
      localStorage.setItem("starlink_user_email", user.email ?? "");
    } else {
      localStorage.removeItem(KEY);
      localStorage.removeItem("starlink_user_email");
    }
    window.dispatchEvent(new Event("starlink:auth-changed"));
  });
}

export async function login(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signup(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function currentUserEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("starlink_user_email") ?? "";
}