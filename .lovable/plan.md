## Goal

Make Starlink Jewels Quotation tool feel simple, guided, and "smart" so a non-technical sales person can use it in seconds. Move data from browser localStorage to **Firebase (Firestore + Auth)** so quotations sync across devices and survive cache clears.

---

## 1. New user flow (simple + guided)

Replace the current admin-style dashboard with a clean, opinionated 3-step flow:

```text
Login  →  Dashboard (Clients + Quotations in one view)
                │
                ├── + New Quotation  (3-step wizard)
                │       Step 1  Pick / add client
                │       Step 2  Fill details (auto-grouped, smart defaults)
                │       Step 3  Preview + Download PDF / Send
                │
                └── Click any client / quote → detail page with status pills
```

Key UX changes:
- **One dashboard, two tabs**: "Quotations" (default) and "Clients". No more separate Clients page.
- **Big "+ New Quotation" button** as the primary action everywhere.
- **3-step wizard** instead of one long form. Each step fits on screen, with a progress bar.
- **Smart defaults**: jewelry type, metal, common diamond rows pre-filled; sales exec auto-filled from logged-in user.
- **Status as colored pills** (Draft / Sent / Needs Changes / Approved) clickable to change.
- **Inline search** on dashboard (search quote no, client name, status).
- **Empty states with one clear CTA**, plain English ("No quotations yet — create your first one").
- **Mobile-friendly**: wizard stacks nicely on phone so sales team can use on the go.
- **Auto-save** every change in wizard → no "Save" button anxiety.
- **"Duplicate quotation"** action so repeat work is one click.

---

## 2. Backend: Firebase

Use the provided config (project `starlinkjewels109`, Firestore database id `qutation`).

**Auth**: Firebase Auth with email/password. Replace the hardcoded `admin/123` login. Seed the admin user on first run via a one-time setup screen, or instruct user to add via Firebase console.

**Firestore collections** (inside database `qutation`):
- `clients/{clientId}` — name, email, phone, company, country, notes, timestamps
- `quotations/{quoteId}` — all current Quotation fields + `clientId`, `ownerUid`, timestamps
- `quotations/{quoteId}/images/{viewName}` — large data URLs split out (front/side/top/perspective) to keep main doc small

**Storage** (optional, recommended): upload CAD images to Firebase Storage instead of base64 data URLs so PDFs stay light and Firestore docs stay under 1 MB.

**Security rules**: only authenticated users can read/write `clients` and `quotations`.

---

## 3. Files to add / change

**Add**
- `src/lib/firebase.ts` — initialize app, auth, firestore (with database id `qutation`), storage
- `src/lib/firestore-clients.ts` — replace `src/lib/clients.ts` (same API surface, async)
- `src/lib/firestore-quotations.ts` — replace `src/lib/quotations.ts` (async)
- `src/components/QuotationWizard.tsx` — 3-step wizard
- `src/components/Dashboard.tsx` — unified tabs view
- `src/components/StatusPill.tsx` — reusable status control
- `src/hooks/useAuth.ts` — Firebase auth hook
- `src/hooks/useQuotations.ts`, `src/hooks/useClients.ts` — live data via `onSnapshot`

**Update**
- `src/routes/login.tsx` — Firebase email/password
- `src/routes/index.tsx` — render new Dashboard
- `src/routes/clients.$id.tsx` — load from Firestore, simpler layout
- `src/routes/quotation.$id.tsx`, `src/routes/quotation.new.tsx` — use wizard + Firestore
- `src/components/QuotationEditor.tsx` — convert to wizard host (or replace)
- `src/components/QuotationForm.tsx` — split into 3 step components
- `src/lib/auth.ts` — delegate to Firebase

**Remove (after migration)**
- localStorage helpers in `clients.ts` / `quotations.ts`

**Keep as-is**
- `src/components/QuotationSheet.tsx` (PDF layout) — only data source changes
- `src/lib/pdf.ts`

---

## 4. Technical notes

- Install: `firebase` (`bun add firebase`).
- Firebase config goes in `src/lib/firebase.ts`. The provided `apiKey` is a public identifier (Firebase web keys are safe in client code) — security is enforced by Firestore rules. **You must enable Email/Password sign-in and publish Firestore rules in the Firebase console.**
- Firestore database id `qutation` is passed via `getFirestore(app, 'qutation')`.
- Replace synchronous `loadAll()` calls with React Query (already in project) wrapping Firestore queries for caching + loading states.
- All routes that read data switch to `useSuspenseQuery` or `useQuery` against Firestore.
- Vercel deploy: no env vars needed (config is public); just `bun run build` + `vercel.json` already routes correctly.

---

## 5. What I need from you before building

1. **Confirm Firebase setup**: have you enabled **Email/Password** auth and created an admin user in Firebase console? If not, I'll add a one-time signup screen so you can create the first account from the app.
2. **Image storage**: ok to use Firebase **Storage** for CAD images (recommended), or keep them as base64 in Firestore (simpler, but 1 MB doc limit)?
3. **Multi-user**: should every logged-in user see all quotations (team mode), or only their own?

Once you confirm, I'll implement everything in one pass.
