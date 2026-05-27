import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { isAuthed, logout } from "@/lib/auth";
import { useDataRefresh } from "@/hooks/useDataRefresh";
import {
  blankClient,
  loadAllClients,
  removeClient,
  upsertClient,
  type Client,
} from "@/lib/clients";
import { loadAll, type Quotation } from "@/lib/quotations";
import {
  LogOut,
  Plus,
  Search,
  Users,
  FileText,
  Globe,
  Trash2,
  ChevronRight,
  Phone,
  Mail,
  X,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  useDataRefresh();
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [ready, setReady] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [draft, setDraft] = useState<Client>(blankClient());
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthed()) { navigate({ to: "/login" }); return; }
    const refresh = () => {
      setClients(loadAllClients());
      setQuotes(loadAll());
      setReady(true);
    };
    refresh();
    window.addEventListener("starlink:data-changed", refresh);
    return () => window.removeEventListener("starlink:data-changed", refresh);
  }, [navigate]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.company.toLowerCase().includes(s) ||
        c.country.toLowerCase().includes(s),
    );
  }, [clients, search]);

  const countByClient = (id: string) => quotes.filter((q) => q.clientId === id).length;
  const latestQuoteForClient = (id: string) =>
    quotes.filter((q) => q.clientId === id).sort((a, b) => b.updatedAt - a.updatedAt)[0];

  const approvedCount = quotes.filter((q) => q.status === "Approved" || q.status === "Completed").length;
  const countries = new Set(clients.map((c) => c.country.trim()).filter(Boolean)).size;

  if (!ready) return null;

  return (
    <div className="dash-page">

      {/* ── Fixed header ── */}
      <AppHeader
        rightSlot={
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="header-logout-btn"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        }
      />

      {/* ── Scrollable content ── */}
      <div className="dash-scroll">
        <div className="dash-main">

          {/* ── Page title + actions ── */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-navy text-2xl font-bold leading-tight">Client Dashboard</h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Manage clients and quotations</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { setDraft(blankClient()); setShowNewClient(true); }}
                className="btn-outline flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                New Client
              </button>
              <Link
                to="/quotation/new"
                className="btn-navy flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              >
                <FileText className="h-3.5 w-3.5" />
                New Quotation
              </Link>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Users}     label="Total Clients" value={clients.length}  accent="navy" />
            <StatCard icon={FileText}  label="Quotations"    value={quotes.length}   accent="navy" />
            <StatCard icon={TrendingUp}label="Approved"      value={approvedCount}   accent="gold" />
            <StatCard icon={Globe}     label="Countries"     value={countries}        accent="navy" />
          </div>

          {/* ── Search ── */}
          <div className="relative search-glass overflow-hidden">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-faint)" }} />
            <input
              type="text"
              placeholder="Search clients by name, email, company or country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm pl-10 pr-10 py-3"
              style={{ color: "var(--text-primary)" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition"
                style={{ color: "var(--text-faint)" }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* ── Section header ── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-navy text-lg font-bold">
                {search ? "Search Results" : "All Clients"}
              </h2>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: "#0D1E52" }}
              >
                {filtered.length}
              </span>
            </div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs font-medium transition"
                style={{ color: "var(--text-muted)" }}
              >
                Clear
              </button>
            )}
          </div>

          {/* ── Client grid ── */}
          {filtered.length === 0 ? (
            <EmptyClients
              hasSearch={!!search.trim()}
              onAdd={() => { setDraft(blankClient()); setShowNewClient(true); }}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((client) => {
                const quoteCount = countByClient(client.id);
                const latest = latestQuoteForClient(client.id);
                return (
                  <ClientCard
                    key={client.id}
                    client={client}
                    quoteCount={quoteCount}
                    latestStatus={latest?.status}
                    onDelete={() => {
                      if (confirm(`Remove "${client.name}"? Their quotations will remain.`)) {
                        removeClient(client.id);
                        setClients(loadAllClients());
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── New Client Modal ── */}
      {showNewClient && (
        <NewClientModal
          draft={draft}
          onChange={setDraft}
          onClose={() => setShowNewClient(false)}
          onSave={() => {
            if (!draft.name.trim()) { toast.error("Client name is required"); return; }
            upsertClient(draft);
            setClients(loadAllClients());
            setShowNewClient(false);
            toast.success("Client added!");
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, accent,
}: { icon: typeof Users; label: string; value: number; accent: "navy" | "gold" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${accent === "gold" ? "stat-icon-gold" : "stat-icon-navy"}`}>
        <Icon className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  Draft:           "status-draft",
  Sent:            "status-sent",
  "Needs Changes": "status-changes",
  Approved:        "status-approved",
  Completed:       "status-completed",
};

function ClientCard({
  client, quoteCount, latestStatus, onDelete,
}: { client: Client; quoteCount: number; latestStatus?: string; onDelete: () => void }) {
  const initials = client.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  const hue = client.id.charCodeAt(0) % 2 === 0
    ? "linear-gradient(135deg, #0D1E52, #1A3179)"
    : "linear-gradient(135deg, #1A3179, #0D3066)";

  return (
    <div className="client-card">
      <Link to="/clients/$id" params={{ id: client.id }} className="flex-1 p-4 block">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: hue }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-display font-bold text-navy text-[14px] leading-tight truncate">{client.name}</h3>
            <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
              {client.company || client.country || "Private Client"}
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-1" style={{ color: "var(--text-faint)" }} />
        </div>

        <div className="space-y-1">
          {client.email && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Mail className="h-3 w-3 shrink-0" style={{ color: "var(--text-faint)" }} />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Phone className="h-3 w-3 shrink-0" style={{ color: "var(--text-faint)" }} />
              <span>{client.phone}</span>
            </div>
          )}
        </div>

        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--border-col)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="text-navy font-bold text-sm">{quoteCount}</span>{" "}
            {quoteCount === 1 ? "quote" : "quotes"}
          </span>
          {latestStatus && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[latestStatus] ?? "status-draft"}`}>
              {latestStatus}
            </span>
          )}
        </div>
      </Link>

      <div className="px-4 pb-3" style={{ borderTop: "1px solid var(--border-col)" }}>
        <button
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="flex items-center gap-1.5 text-[11px] font-medium py-2 transition"
          style={{ color: "var(--text-faint)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}
        >
          <Trash2 className="h-3 w-3" />
          Remove
        </button>
      </div>
    </div>
  );
}

function EmptyClients({ hasSearch, onAdd }: { hasSearch: boolean; onAdd: () => void }) {
  return (
    <div
      className="card-premium-static p-16 text-center"
      style={{ border: "2px dashed var(--border-col)" }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "var(--bg)" }}
      >
        <Users className="h-7 w-7" style={{ color: "var(--text-faint)" }} />
      </div>
      <h3 className="font-display text-navy text-lg font-bold mb-1.5">
        {hasSearch ? "No clients found" : "No clients yet"}
      </h3>
      <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
        {hasSearch ? "Try a different search term." : "Add your first client to get started building quotations."}
      </p>
      {!hasSearch && (
        <button
          onClick={onAdd}
          className="btn-navy inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
        >
          <Plus className="h-4 w-4" />
          Add First Client
        </button>
      )}
    </div>
  );
}

function NewClientModal({
  draft, onChange, onClose, onSave,
}: { draft: Client; onChange: (c: Client) => void; onClose: () => void; onSave: () => void }) {
  const fields: { label: string; key: keyof Client; type?: string; placeholder?: string }[] = [
    { label: "Customer Name *", key: "name",    placeholder: "e.g. John Smith" },
    { label: "Phone Number",    key: "phone",   type: "tel",   placeholder: "+1 555 000 0000" },
    { label: "Email Address",   key: "email",   type: "email", placeholder: "john@email.com" },
    { label: "Company",         key: "company", placeholder: "e.g. Smith Jewels Ltd." },
    { label: "Country",         key: "country", placeholder: "e.g. USA" },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">

        {/* Header */}
        <div className="modal-head">
          <div>
            <h2 className="font-display text-white font-bold text-lg leading-tight">New Client</h2>
            <p className="text-white/40 text-xs mt-0.5">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {fields.map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label
                className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </label>
              <input
                type={type || "text"}
                placeholder={placeholder}
                value={draft[key] as string}
                onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
                className="input-premium"
              />
            </div>
          ))}
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Notes (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any notes about this client…"
              value={draft.notes}
              onChange={(e) => onChange({ ...draft, notes: e.target.value })}
              className="input-premium resize-none"
              style={{ height: "auto", paddingTop: "0.625rem", paddingBottom: "0.625rem" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-foot">
          <button onClick={onClose} className="btn-outline flex-1 h-10 rounded-lg text-sm">
            Cancel
          </button>
          <button onClick={onSave} className="btn-navy flex-1 h-10 rounded-lg text-sm">
            Save Client
          </button>
        </div>

      </div>
    </div>
  );
}
