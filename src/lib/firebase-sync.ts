import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import { isAuthed } from "./auth";
import type { Client } from "./clients";
import type { Quotation } from "./quotations";

const KEY_CLIENTS = "starlink_clients_v1";
const KEY_QUOTES = "starlink_quotations_v1";

let unsubs: Array<() => void> = [];
let syncActive = false;

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("starlink:data-changed"));
}

export function startSync() {
  if (syncActive) return;
  syncActive = true;

  unsubs.push(
    onSnapshot(
      collection(db, "clients"),
      (snap) => {
        const items = snap.docs
          .map((d) => d.data() as Client)
          .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        localStorage.setItem(KEY_CLIENTS, JSON.stringify(items));
        emit();
        console.log("[firebase] clients synced:", items.length);
      },
      (err) => console.error("[firebase] clients listener error:", err.message),
    ),
  );

  unsubs.push(
    onSnapshot(
      collection(db, "quotations"),
      (snap) => {
        const items = snap.docs
          .map((d) => d.data() as Quotation)
          .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        localStorage.setItem(KEY_QUOTES, JSON.stringify(items));
        emit();
        console.log("[firebase] quotations synced:", items.length);
      },
      (err) => console.error("[firebase] quotations listener error:", err.message),
    ),
  );

  console.log("[firebase] Firestore real-time sync started ✓");
}

export function stopSync() {
  unsubs.forEach((u) => u());
  unsubs = [];
  syncActive = false;
  console.log("[firebase] sync stopped");
}

export function initFirebaseSync() {
  if (typeof window === "undefined") return;

  if (isAuthed()) {
    startSync();
  }

  window.addEventListener("starlink:auth-changed", () => {
    if (isAuthed()) {
      startSync();
    } else {
      stopSync();
    }
  });
}

export function pushClient(c: Client) {
  if (!syncActive) return;
  setDoc(doc(db, "clients", c.id), { ...c }).catch((e) =>
    console.error("[firebase] client push failed:", e.message),
  );
}

export function removeClientRemote(id: string) {
  if (!syncActive) return;
  deleteDoc(doc(db, "clients", id)).catch((e) =>
    console.error("[firebase] client delete failed:", e.message),
  );
}

export function pushQuotation(q: Quotation) {
  if (!syncActive) return;
  setDoc(doc(db, "quotations", q.id), { ...q }).catch((e) =>
    console.error("[firebase] quotation push failed:", e.message),
  );
}

export function removeQuotationRemote(id: string) {
  if (!syncActive) return;
  deleteDoc(doc(db, "quotations", id)).catch((e) =>
    console.error("[firebase] quotation delete failed:", e.message),
  );
}
