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
  Trash2,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  X,
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

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        portalLabel="Quotation Portal"
        rightSlot={
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition font-medium text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
          <button
            onClick={() => { setDraft(blankClient()); setShowNewClient(true); }}
            className="flex items-center justify-center gap-2 bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-2xl py-4 px-4 font-bold text-sm sm:text-base transition shadow-sm"
          >
            <Plus className="h-5 w-5" />
            New Client
          </button>
          <Link
            to="/quotation/new"
            className="flex items-center justify-center gap-2 text-white rounded-2xl py-4 px-4 font-bold text-sm sm:text-base transition shadow-md"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}
          >
            <FileText className="h-5 w-5" />
            New Quotation
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill icon={Users} label="Clients" value={clients.length} color="blue" />
          <StatPill icon={FileText} label="Quotations" value={quotes.length} color="indigo" />
          <StatPill
            icon={Globe}
            label="Countries"
            value={new Set(clients.map((c) => c.country.trim()).filter(Boolean)).size}
            color="violet"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients by name, email, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 text-base focus:outline-none focus:border-blue-400 transition"
          />
        </div>

        {/* Clients */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">
              {search ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : "All Clients"}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <EmptyClients hasSearch={!!search.trim()} onAdd={() => { setDraft(blankClient()); setShowNewClient(true); }} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      </main>

      {/* New Client Modal */}
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

function StatPill({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    indigo: "bg-indigo-50 text-indigo-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className={`rounded-2xl p-3 sm:p-4 ${colors[color]} flex flex-col items-center gap-1`}>
      <Icon className="h-5 w-5 opacity-70" />
      <p className="text-xl sm:text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs font-medium opacity-70">{label}</p>
    </div>
  );
}

const STATUS_DOT: Record<string, string> = {
  Draft: "bg-slate-400",
  Sent: "bg-blue-500",
  "Needs Changes": "bg-amber-500",
  Approved: "bg-emerald-500",
  Completed: "bg-slate-700",
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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
      <Link to="/clients/$id" params={{ id: client.id }} className="block p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{client.name}</h3>
            <p className="text-sm text-slate-500 truncate mt-0.5">{client.company || client.country || "Private Client"}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition shrink-0 mt-1" />
        </div>

        <div className="mt-3 space-y-1.5">
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{quoteCount}</span> quotation{quoteCount !== 1 ? "s" : ""}
          </span>
          {latestStatus && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[latestStatus] ?? "bg-slate-400"}`} />
              {latestStatus}
            </span>
          )}
        </div>
      </Link>

      <div className="px-4 pb-3">
        <button
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition py-1"
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
    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
      <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-slate-700 mb-1">
        {hasSearch ? "No clients found" : "No clients yet"}
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        {hasSearch ? "Try a different search term." : "Add your first client to get started."}
      </p>
      {!hasSearch && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm transition"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">New Client</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {fields.map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
              <input
                type={type || "text"}
                placeholder={placeholder}
                value={draft[key] as string}
                onChange={(e) => onChange({ ...draft, [key]: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 transition bg-slate-50"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (optional)</label>
            <textarea
              rows={3}
              placeholder="Any notes about this client..."
              value={draft.notes}
              onChange={(e) => onChange({ ...draft, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 transition bg-slate-50 resize-none text-sm"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 h-12 rounded-xl text-white font-bold transition"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}
          >
            Save Client
          </button>
        </div>
      </div>
    </div>
  );
}
