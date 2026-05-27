import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "./firebase";
import type { Client } from "./clients";
import type { Quotation } from "./quotations";

const KEY_CLIENTS = "starlink_clients_v1";
const KEY_QUOTES = "starlink_quotations_v1";

let started = false;
let unsubs: Array<() => void> = [];

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("starlink:data-changed"));
}

export function initFirebaseSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  onAuthStateChanged(auth, (user) => {
    unsubs.forEach((u) => u());
    unsubs = [];
    if (!user) return;
    unsubs.push(
      onSnapshot(collection(db, "clients"), (snap) => {
        const items = snap.docs
          .map((d) => d.data() as Client)
          .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        localStorage.setItem(KEY_CLIENTS, JSON.stringify(items));
        emit();
      }),
    );
    unsubs.push(
      onSnapshot(collection(db, "quotations"), (snap) => {
        const items = snap.docs
          .map((d) => d.data() as Quotation)
          .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        localStorage.setItem(KEY_QUOTES, JSON.stringify(items));
        emit();
      }),
    );
  });
}

export function pushClient(c: Client) {
  if (!auth.currentUser) return;
  setDoc(doc(db, "clients", c.id), c).catch((e) =>
    console.error("client sync failed", e),
  );
}

export function removeClientRemote(id: string) {
  if (!auth.currentUser) return;
  deleteDoc(doc(db, "clients", id)).catch((e) =>
    console.error("client delete failed", e),
  );
}

export function pushQuotation(q: Quotation) {
  if (!auth.currentUser) return;
  setDoc(doc(db, "quotations", q.id), q).catch((e) =>
    console.error("quotation sync failed", e),
  );
}

export function removeQuotationRemote(id: string) {
  if (!auth.currentUser) return;
  deleteDoc(doc(db, "quotations", id)).catch((e) =>
    console.error("quotation delete failed", e),
  );
}