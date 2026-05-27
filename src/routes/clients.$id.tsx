import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { isAuthed } from "@/lib/auth";
import { useDataRefresh } from "@/hooks/useDataRefresh";
import { getClient, upsertClient, type Client } from "@/lib/clients";
import {
  listByClient,
  QUOTATION_STATUSES,
  remove,
  upsert,
  type Quotation,
  type QuotationStatus,
} from "@/lib/quotations";
import {
  ArrowLeft,
  Plus,
  Eye,
  Trash2,
  FileText,
  Phone,
  Mail,
  MapPin,
  Building2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clients/$id")({
  component: ClientDetail,
});

const STATUS_STYLE: Record<QuotationStatus, { badge: string; dot: string; label: string }> = {
  Draft:          { badge: "status-draft",     dot: "#9CA3AF", label: "Draft" },
  Sent:           { badge: "status-sent",      dot: "#3B82F6", label: "Sent" },
  "Needs Changes":{ badge: "status-changes",   dot: "#F59E0B", label: "Needs Changes" },
  Approved:       { badge: "status-approved",  dot: "#22C55E", label: "Approved" },
  Completed:      { badge: "status-completed", dot: "#FFFFFF", label: "Completed" },
};

function ClientDetail() {
  const navigate = useNavigate();
  useDataRefresh();
  const { id } = Route.useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isAuthed()) { navigate({ to: "/login" }); return; }
    const refresh = () => {
      const c = getClient(id);
      if (!c) return;
      setClient(c);
      setQuotes(listByClient(id));
    };
    refresh();
    window.addEventListener("starlink:data-changed", refresh);
    return () => window.removeEventListener("starlink:data-changed", refresh);
  }, [id, navigate]);

  const sorted = useMemo(
    () => [...quotes].sort((a, b) => b.updatedAt - a.updatedAt),
    [quotes],
  );

  if (!client) return null;

  const update = (patch: Partial<Client>) => setClient({ ...client, ...patch });
  const save = () => { upsertClient(client); toast.success("Client updated"); setEditing(false); };
  const cancel = () => { setClient(getClient(id)!); setEditing(false); };

  const setStatus = (quoteId: string, status: QuotationStatus) => {
    const q = quotes.find((x) => x.id === quoteId);
    if (!q) return;
    upsert({ ...q, status });
    setQuotes(listByClient(id));
    toast.success(`Status → ${status}`);
  };

  const initials = client.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen" style={{ background: "#F5F4F0" }}>
      <AppHeader
        portalLabel="Client Details"
        leftSlot={
          <Link to="/">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </Link>
        }
      />

      <main className="page-shell py-8 space-y-6">

        {/* ── Client Profile Card ── */}
        <div className="card-premium-static overflow-hidden">
          {/* Card top banner */}
          <div className="navy-gradient diamond-pattern h-24 relative">
            <div className="absolute inset-0 flex items-end pb-0">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-8 bg-[#F5F4F0] rounded-t-[2rem]" />
            </div>
          </div>

          <div className="px-6 pb-6 -mt-8 relative">
            {/* Avatar */}
            <div className="flex items-end justify-between mb-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white"
                style={{ background: "linear-gradient(135deg, #0D1E52, #1A3179)" }}
              >
                {initials}
              </div>
              <div className="flex gap-2 mb-2">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-outline flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </button>
                ) : (
                  <>
                    <button onClick={cancel} className="btn-outline flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                    <button onClick={save} className="btn-navy flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm">
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Name */}
            {editing ? (
              <input
                value={client.name}
                onChange={(e) => update({ name: e.target.value })}
                className="input-premium font-display text-xl font-bold text-navy mb-1"
              />
            ) : (
              <h1 className="font-display text-navy text-2xl font-bold mb-0.5">{client.name}</h1>
            )}
            <p className="text-gray-500 text-sm">{client.company || client.country || "Private Client"}</p>

            {/* Contact fields */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {editing ? (
                <>
                  <ContactEditField icon={Mail} label="Email" value={client.email} onChange={(v) => update({ email: v })} type="email" />
                  <ContactEditField icon={Phone} label="Phone" value={client.phone} onChange={(v) => update({ phone: v })} type="tel" />
                  <ContactEditField icon={Building2} label="Company" value={client.company} onChange={(v) => update({ company: v })} />
                  <ContactEditField icon={MapPin} label="Country" value={client.country} onChange={(v) => update({ country: v })} />
                </>
              ) : (
                <>
                  {client.email && <ContactRow icon={Mail} value={client.email} />}
                  {client.phone && <ContactRow icon={Phone} value={client.phone} />}
                  {client.company && <ContactRow icon={Building2} value={client.company} />}
                  {client.country && <ContactRow icon={MapPin} value={client.country} />}
                </>
              )}
            </div>

            {editing && (
              <div className="mt-3">
                <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">Notes</label>
                <textarea
                  rows={2}
                  value={client.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  className="input-premium resize-none py-3 h-auto"
                  style={{ height: "auto" }}
                />
              </div>
            )}

            {client.notes && !editing && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-sm text-amber-900">
                {client.notes}
              </div>
            )}

            {/* CTA */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <Link
                to="/quotation/new"
                search={{ clientId: id }}
                className="btn-navy inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm w-full sm:w-auto justify-center"
              >
                <Plus className="h-4 w-4" />
                Create New Quotation
              </Link>
            </div>
          </div>
        </div>

        {/* ── Status Summary ── */}
        <div className="grid grid-cols-5 gap-3">
          {QUOTATION_STATUSES.map((status) => {
            const count = quotes.filter((q) => q.status === status).length;
            const { badge, dot } = STATUS_STYLE[status];
            return (
              <div key={status} className="card-premium-static p-4 text-center">
                <div
                  className="w-2.5 h-2.5 rounded-full mx-auto mb-2"
                  style={{
                    background: status === "Completed" ? "#0D1E52" :
                                status === "Approved" ? "#22C55E" :
                                status === "Needs Changes" ? "#F59E0B" :
                                status === "Sent" ? "#3B82F6" : "#9CA3AF"
                  }}
                />
                <p className="text-2xl font-bold text-navy">{count}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-1 leading-tight hidden sm:block">{status}</p>
              </div>
            );
          })}
        </div>

        {/* ── Quotations ── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-navy text-xl font-bold">Quotations</h2>
            <span className="bg-navy text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {sorted.length}
            </span>
          </div>

          {sorted.length === 0 ? (
            <div className="card-premium-static border-2 border-dashed border-gray-200 p-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="font-display text-navy text-lg font-bold mb-1">No quotations yet</h3>
              <p className="text-gray-400 text-sm mb-5">Create the first quotation for this client.</p>
              <Link
                to="/quotation/new"
                search={{ clientId: id }}
                className="btn-navy inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
              >
                <Plus className="h-4 w-4" />
                Create Quotation
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onStatusChange={(s) => setStatus(quote.id, s)}
                  onDelete={() => {
                    if (confirm(`Delete "${quote.quoteNo}"? This cannot be undone.`)) {
                      remove(quote.id);
                      setQuotes(listByClient(id));
                      toast.success("Quotation deleted");
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ContactRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-100">
      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  );
}

function ContactEditField({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-premium pl-10"
      />
    </div>
  );
}

function QuoteCard({
  quote,
  onStatusChange,
  onDelete,
}: {
  quote: Quotation;
  onStatusChange: (s: QuotationStatus) => void;
  onDelete: () => void;
}) {
  const { badge } = STATUS_STYLE[quote.status];
  const thumb = quote.imageFront || quote.imagePerspective || quote.imageSide || quote.imageTop;

  return (
    <div className="card-premium-static">
      <div className="p-4 sm:p-5 flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
          {thumb ? (
            <img src={thumb} alt={quote.quoteNo} className="w-full h-full object-cover" />
          ) : (
            <FileText className="h-6 w-6 text-gray-300" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-display font-bold text-navy text-base">{quote.quoteNo}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {quote.jewelryType}{quote.jewelryType && quote.date ? " · " : ""}{quote.date}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
              {quote.status}
            </span>
          </div>

          {quote.totalPrice && (
            <p className="mt-2 text-sm font-bold text-navy">
              {quote.totalPrice}{" "}
              <span className="text-gray-400 font-normal text-xs">{quote.currency}</span>
            </p>
          )}
        </div>
      </div>

      {/* Actions bar */}
      <div className="border-t border-gray-100 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 flex-wrap bg-gray-50/50 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Status:</span>
          <select
            value={quote.status}
            onChange={(e) => onStatusChange(e.target.value as QuotationStatus)}
            className="text-xs font-semibold rounded-lg border border-gray-200 px-2 py-1.5 text-navy focus:outline-none focus:border-navy bg-white cursor-pointer"
          >
            {QUOTATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/quotation/$id" params={{ id: quote.id }}>
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg btn-navy text-xs">
              <Eye className="h-3.5 w-3.5" /> Open
            </button>
          </Link>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
