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

const STATUS_COLORS: Record<QuotationStatus, { bg: string; text: string; dot: string }> = {
  Draft:          { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400" },
  Sent:           { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  "Needs Changes":{ bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500" },
  Approved:       { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Completed:      { bg: "bg-slate-800",   text: "text-white",       dot: "bg-white" },
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

  const save = () => {
    upsertClient(client);
    toast.success("Client updated");
    setEditing(false);
  };

  const cancel = () => {
    setClient(getClient(id)!);
    setEditing(false);
  };

  const setStatus = (quoteId: string, status: QuotationStatus) => {
    const q = quotes.find((x) => x.id === quoteId);
    if (!q) return;
    upsert({ ...q, status });
    setQuotes(listByClient(id));
    toast.success(`Status updated to ${status}`);
  };

  const initials = client.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        portalLabel="Client Details"
        leftSlot={
          <Link to="/">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Client Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}
              >
                {initials}
              </div>
              <div>
                {editing ? (
                  <input
                    value={client.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="text-xl font-bold text-slate-800 border-b-2 border-blue-400 focus:outline-none bg-transparent w-full"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-slate-800">{client.name}</h1>
                )}
                <p className="text-sm text-slate-500 mt-0.5">{client.company || client.country || "Private Client"}</p>
              </div>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
              >
                <Edit2 className="h-4 w-4" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={save} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition">
                  <Check className="h-4 w-4" /> Save
                </button>
                <button onClick={cancel} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition">
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
              <textarea
                rows={2}
                value={client.notes}
                onChange={(e) => update({ notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-blue-400 resize-none bg-slate-50"
              />
            </div>
          )}

          {client.notes && !editing && (
            <div className="mt-3 bg-slate-50 rounded-xl p-3 text-sm text-slate-600 border border-slate-100">
              {client.notes}
            </div>
          )}

          {/* New Quotation CTA */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <Link
              to="/quotation/new"
              search={{ clientId: id }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto sm:inline-flex px-6 py-3.5 rounded-xl text-white font-bold text-base transition"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}
            >
              <Plus className="h-5 w-5" />
              Create New Quotation
            </Link>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-5 gap-2">
          {QUOTATION_STATUSES.map((status) => {
            const count = quotes.filter((q) => q.status === status).length;
            const { bg, text, dot } = STATUS_COLORS[status];
            return (
              <div key={status} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-xl font-bold ${text}`}>{count}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  <p className={`text-[10px] font-semibold ${text} leading-tight hidden sm:block`}>{status}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quotations List */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">
              Quotations <span className="text-slate-400 font-normal text-base">({sorted.length})</span>
            </h2>
          </div>

          {sorted.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">No quotations yet</h3>
              <p className="text-sm text-slate-400 mb-6">Create the first quotation for this client.</p>
              <Link
                to="/quotation/new"
                search={{ clientId: id }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}
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
    <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2.5">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
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
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-9 pr-3 rounded-xl border-2 border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-blue-400 bg-slate-50"
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
  const { bg, text, dot } = STATUS_COLORS[quote.status];
  const thumb = quote.imageFront || quote.imagePerspective || quote.imageSide || quote.imageTop;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
          {thumb ? (
            <img src={thumb} alt={quote.quoteNo} className="w-full h-full object-cover" />
          ) : (
            <FileText className="h-6 w-6 text-slate-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-slate-800 text-base">{quote.quoteNo}</p>
              <p className="text-sm text-slate-500 mt-0.5">{quote.jewelryType} · {quote.date}</p>
            </div>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {quote.status}
            </span>
          </div>

          {quote.totalPrice && (
            <p className="mt-2 text-sm font-semibold text-slate-700">{quote.totalPrice} <span className="text-slate-400 font-normal">{quote.currency}</span></p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        {/* Status Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={quote.status}
            onChange={(e) => onStatusChange(e.target.value as QuotationStatus)}
            className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1 text-slate-700 focus:outline-none focus:border-blue-400 bg-white cursor-pointer"
          >
            {QUOTATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/quotation/$id" params={{ id: quote.id }}>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition">
              <Eye className="h-4 w-4" /> Open
            </button>
          </Link>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition text-sm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
