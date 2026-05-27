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
      <div className="dash-bg-orb-1" />
      <div className="dash-bg-orb-2" />

      <AppHeader
        rightSlot={
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            style={{ color: "rgba(60,60,67,0.6)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#0D1E52")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(60,60,67,0.6)")}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        }
      />

      <div className="dash-main">

        {/* ── Page title + actions ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-navy text-2xl lg:text-3xl font-bold">Client Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage clients and quotations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setDraft(blankClient()); setShowNewClient(true); }}
              className="btn-outline flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
            >
              <Plus className="h-4 w-4" />
              New Client
            </button>
            <Link
              to="/quotation/new"
              className="btn-navy flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
            >
              <FileText className="h-4 w-4" />
              New Quotation
            </Link>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Clients" value={clients.length} accent="navy" />
          <StatCard icon={FileText} label="Quotations" value={quotes.length} accent="navy" />
          <StatCard icon={TrendingUp} label="Approved" value={approvedCount} accent="gold" />
          <StatCard icon={Globe} label="Countries" value={countries} accent="navy" />
        </div>

        {/* ── Search ── */}
        <div className="relative search-glass rounded-xl overflow-hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search clients by name, email, company or country…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 pl-11 pr-10 py-3.5"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ── Section header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-navy text-xl font-bold">
              {search ? "Search Results" : "All Clients"}
            </h2>
            <span className="bg-navy text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {filtered.length}
            </span>
          </div>
          {search && (
            <button onClick={() => setSearch("")} className="text-sm text-gray-500 hover:text-navy transition">
              Clear search
            </button>
          )}
        </div>

        {/* ── Client grid ── */}
        {filtered.length === 0 ? (
          <EmptyClients hasSearch={!!search.trim()} onAdd={() => { setDraft(blankClient()); setShowNewClient(true); }} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  accent: "navy" | "gold";
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${accent === "gold" ? "stat-icon-gold" : "stat-icon-navy"}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  Draft:            "status-draft",
  Sent:             "status-sent",
  "Needs Changes":  "status-changes",
  Approved:         "status-approved",
  Completed:        "status-completed",
};

function ClientCard({
  client,
  quoteCount,
  latestStatus,
  onDelete,
}: {
  client: Client;
  quoteCount: number;
  latestStatus?: string;
  onDelete: () => void;
}) {
  const initials = client.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const hue = client.id.charCodeAt(0) % 2 === 0
    ? "linear-gradient(135deg, #0D1E52, #1A3179)"
    : "linear-gradient(135deg, #1A3179, #0D3066)";

  return (
    <div className="client-card">
      <Link to="/clients/$id" params={{ id: client.id }} className="flex-1 p-5 block">
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md"
            style={{ background: hue }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-display font-bold text-navy text-[15px] leading-tight truncate">{client.name}</h3>
            <p className="text-gray-500 text-xs truncate mt-0.5">{client.company || client.country || "Private Client"}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
        </div>

        <div className="space-y-1.5">
          {client.email && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3.5 border-t border-black/5 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">
            <span className="text-navy font-bold text-sm">{quoteCount}</span>{" "}
            {quoteCount === 1 ? "quotation" : "quotations"}
          </span>
          {latestStatus && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[latestStatus] ?? "status-draft"}`}>
              {latestStatus}
            </span>
          )}
        </div>
      </Link>

      <div className="px-5 pb-4 border-t border-black/5">
        <button
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-red-500 transition py-2.5 font-medium"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove client
        </button>
      </div>
    </div>
  );
}

function EmptyClients({ hasSearch, onAdd }: { hasSearch: boolean; onAdd: () => void }) {
  return (
    <div className="card-premium-static border-2 border-dashed border-black/10 p-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-black/5 flex items-center justify-center mx-auto mb-4">
        <Users className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="font-display text-navy text-xl font-bold mb-1.5">
        {hasSearch ? "No clients found" : "No clients yet"}
      </h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
        {hasSearch ? "Try a different search term." : "Add your first client to get started building quotations."}
      </p>
      {!hasSearch && (
        <button
          onClick={onAdd}
          className="btn-navy inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
        >
          <Plus className="h-4 w-4" />
          Add First Client
        </button>
      )}
    </div>
  );
}

function NewClientModal({
  draft,
  onChange,
  onClose,
  onSave,
}: {
  draft: Client;
  onChange: (c: Client) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const fields: { label: string; key: keyof Client; type?: string; placeholder?: string }[] = [
    { label: "Customer Name *", key: "name", placeholder: "e.g. John Smith" },
    { label: "Phone Number", key: "phone", type: "tel", placeholder: "e.g. +1 555 000 0000" },
    { label: "Email Address", key: "email", type: "email", placeholder: "e.g. john@email.com" },
    { label: "Company", key: "company", placeholder: "e.g. Smith Jewels Ltd." },
    { label: "Country", key: "country", placeholder: "e.g. USA" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="modal-glass w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="modal-header">
          <div>
            <h2 className="font-display text-white text-xl font-bold">New Client</h2>
            <p className="text-white/50 text-xs mt-0.5">Fill in the client details below</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {fields.map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-[11px] font-semibold text-navy/70 uppercase tracking-wider mb-1.5">{label}</label>
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
            <label className="block text-[11px] font-semibold text-navy/70 uppercase tracking-wider mb-1.5">Notes (optional)</label>
            <textarea
              rows={3}
              placeholder="Any notes about this client..."
              value={draft.notes}
              onChange={(e) => onChange({ ...draft, notes: e.target.value })}
              className="input-premium resize-none py-3 h-auto"
              style={{ height: "auto" }}
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 h-11 rounded-xl text-sm">
            Cancel
          </button>
          <button onClick={onSave} className="btn-navy flex-1 h-11 rounded-xl text-sm">
            Save Client
          </button>
        </div>
      </div>
    </div>
  );
}
