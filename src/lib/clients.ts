export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

const KEY = "starlink_clients_v1";

import { pushClient, removeClientRemote } from "./firebase-sync";

export function loadAllClients(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAllClients(items: Client[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getClient(id: string): Client | undefined {
  return loadAllClients().find((c) => c.id === id);
}

export function upsertClient(c: Client) {
  const all = loadAllClients();
  const idx = all.findIndex((x) => x.id === c.id);
  c.updatedAt = Date.now();
  if (idx >= 0) all[idx] = c;
  else all.unshift(c);
  saveAllClients(all);
  pushClient(c);
}

export function removeClient(id: string) {
  saveAllClients(loadAllClients().filter((c) => c.id !== id));
  removeClientRemote(id);
}

export function blankClient(): Client {
  return {
    id: crypto.randomUUID(),
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "USA",
    notes: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
