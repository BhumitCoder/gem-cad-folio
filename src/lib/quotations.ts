export interface DiamondRow {
  id: string;
  shape: string;
  size: string;
  qty: number;
  totalWeight: number;
}

export interface PriceRow {
  id: string;
  description: string;
  amount: string; // free-form so "Included" works
}

export type QuotationStatus =
  | "Draft"
  | "Sent"
  | "Needs Changes"
  | "Approved"
  | "Completed";

export const QUOTATION_STATUSES: QuotationStatus[] = [
  "Draft",
  "Sent",
  "Needs Changes",
  "Approved",
  "Completed",
];

export interface Quotation {
  id: string;
  clientId: string;
  quoteNo: string;
  date: string;
  validity: string;
  status: QuotationStatus;
  customerName: string;
  customerEmail: string;
  salesExecutive: string;
  salesEmail: string;
  productLink: string;
  // images (data URLs)
  imageFront: string;
  imageSide: string;
  imageTop: string;
  imagePerspective: string;
  // specs
  jewelryType: string;
  metal: string;
  grossWeight: string;
  netGoldWeight: string;
  centerStone: string;
  sideDiamonds: string;
  totalDiamondWeight: string;
  diamondQuality: string;
  ringSize: string;
  settingType: string;
  polish: string;
  // diamond breakdown
  diamonds: DiamondRow[];
  // price
  prices: PriceRow[];
  totalPrice: string;
  currency: string;
  // terms
  terms: string[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

const KEY = "starlink_quotations_v1";

export function loadAll(): Quotation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAll(items: Quotation[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getById(id: string): Quotation | undefined {
  return loadAll().find((q) => q.id === id);
}

export function upsert(q: Quotation) {
  const all = loadAll();
  const idx = all.findIndex((x) => x.id === q.id);
  q.updatedAt = Date.now();
  if (idx >= 0) all[idx] = q;
  else all.unshift(q);
  saveAll(all);
}

export function remove(id: string) {
  saveAll(loadAll().filter((q) => q.id !== id));
}

export function nextQuoteNo(): string {
  const year = new Date().getFullYear();
  const all = loadAll();
  const max = all
    .map((q) => {
      const m = q.quoteNo.match(/SJ-(\d{4})-(\d+)/);
      return m && Number(m[1]) === year ? Number(m[2]) : 0;
    })
    .reduce((a, b) => Math.max(a, b), 100);
  return `SJ-${year}-${max + 1}`;
}

export function listByClient(clientId: string): Quotation[] {
  return loadAll().filter((q) => q.clientId === clientId);
}

export function blankQuotation(client?: {
  id: string;
  name: string;
  email: string;
}): Quotation {
  return {
    id: crypto.randomUUID(),
    clientId: client?.id ?? "",
    quoteNo: nextQuoteNo(),
    date: new Date().toISOString().slice(0, 10),
    validity: "7 Days",
    status: "Draft",
    customerName: client?.name ?? "",
    customerEmail: client?.email ?? "",
    salesExecutive: "Hardik Vasoya",
    salesEmail: "info@starlinkjewels.com",
    productLink: "",
    imageFront: "",
    imageSide: "",
    imageTop: "",
    imagePerspective: "",
    jewelryType: "Engagement Ring",
    metal: "14KT White Gold",
    grossWeight: "8.25 Grams",
    netGoldWeight: "7.10 Grams",
    centerStone: "3.00 CT Emerald Cut",
    sideDiamonds: "Round Brilliant Lab Diamonds",
    totalDiamondWeight: "4.20 CT",
    diamondQuality: "F-G / VS",
    ringSize: "US 7",
    settingType: "Hidden Halo",
    polish: "High Polish Finish",
    diamonds: [
      { id: crypto.randomUUID(), shape: "Emerald Cut", size: "3.00 CT", qty: 1, totalWeight: 3.0 },
      { id: crypto.randomUUID(), shape: "Round", size: "1.20 mm", qty: 42, totalWeight: 0.42 },
      { id: crypto.randomUUID(), shape: "Round", size: "1.80 mm", qty: 28, totalWeight: 0.78 },
    ],
    prices: [
      { id: crypto.randomUUID(), description: "Gold Value", amount: "$485" },
      { id: crypto.randomUUID(), description: "Lab Diamond Value", amount: "$1,950" },
      { id: crypto.randomUUID(), description: "Making Charges", amount: "$320" },
      { id: crypto.randomUUID(), description: "CAD Charges", amount: "Included" },
      { id: crypto.randomUUID(), description: "Setting Charges", amount: "Included" },
      { id: crypto.randomUUID(), description: "Certification", amount: "Included" },
      { id: crypto.randomUUID(), description: "Shipping", amount: "$85" },
    ],
    totalPrice: "$2,840",
    currency: "USD",
    terms: [
      "Production Time: 10–14 Business Days",
      "IGI Certification Included",
      "50% Advance Required",
      "Final Product May Have Slight Weight Variation",
      "Shipping via FedEx / DHL",
      "Prices Subject to Gold Market Changes",
    ],
    notes: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}