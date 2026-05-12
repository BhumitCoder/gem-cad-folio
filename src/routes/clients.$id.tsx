import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { isAuthed } from "@/lib/auth";
import { getClient, upsertClient, type Client } from "@/lib/clients";
import {
  listByClient,
  upsert,
  remove,
  type Quotation,
  type QuotationStatus,
  QUOTATION_STATUSES,
} from "@/lib/quotations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Eye,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clients/$id")({
  component: ClientDetail,
});

const STATUS_STYLE: Record<QuotationStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Sent: "bg-primary/10 text-primary",
  "Needs Changes": "bg-amber-500/15 text-amber-700",
  Approved: "bg-emerald-500/15 text-emerald-700",
  Completed: "bg-ink text-white",
};

function ClientDetail() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/login" });
      return;
    }
    const c = getClient(id);
    if (!c) {
      toast.error("Client not found");
      navigate({ to: "/" });
      return;
    }
    setClient(c);
    setQuotes(listByClient(id));
  }, [id, navigate]);

  const sorted = useMemo(
    () => [...quotes].sort((a, b) => b.updatedAt - a.updatedAt),
    [quotes],
  );

  if (!client) return null;

  const updateField = (patch: Partial<Client>) => {
    const next = { ...client, ...patch };
    setClient(next);
  };

  const saveClient = () => {
    upsertClient(client);
    toast.success("Client updated");
    setEditing(false);
  };

  const setStatus = (qid: string, status: QuotationStatus) => {
    const q = quotes.find((x) => x.id === qid);
    if (!q) return;
    const next = { ...q, status };
    upsert(next);
    setQuotes(listByClient(id));
    toast.success(`Status: ${status}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button
                size="sm"
                variant="ghost"
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Clients
              </Button>
            </Link>
          </div>
          <img
            src="https://starlinkjewels.com/assets/starlink-logo-horizontal-DJzhPoqe.png"
            alt="Starlink Jewels"
            className="h-7 w-auto opacity-90"
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[320px_1fr]">
        {/* CLIENT CARD */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full gold-gradient text-base font-semibold text-white">
                {client.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="font-display text-2xl leading-tight">
                  {client.name || "—"}
                </h2>
                {client.company && (
                  <p className="text-xs text-muted-foreground">
                    {client.company}
                  </p>
                )}
              </div>
            </div>

            {!editing ? (
              <>
                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {client.email || "—"}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {client.phone || "—"}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {client.company || "—"}
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {client.country || "—"}
                  </li>
                </ul>
                {client.notes && (
                  <p className="mt-4 whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    {client.notes}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-5 w-full"
                  onClick={() => setEditing(true)}
                >
                  Edit Client
                </Button>
              </>
            ) : (
              <div className="mt-5 space-y-3">
                <Field label="Name">
                  <Input
                    value={client.name}
                    onChange={(e) => updateField({ name: e.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={client.email}
                    onChange={(e) => updateField({ email: e.target.value })}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={client.phone}
                    onChange={(e) => updateField({ phone: e.target.value })}
                  />
                </Field>
                <Field label="Company">
                  <Input
                    value={client.company}
                    onChange={(e) => updateField({ company: e.target.value })}
                  />
                </Field>
                <Field label="Country">
                  <Input
                    value={client.country}
                    onChange={(e) => updateField({ country: e.target.value })}
                  />
                </Field>
                <Field label="Notes">
                  <Textarea
                    rows={3}
                    value={client.notes}
                    onChange={(e) => updateField({ notes: e.target.value })}
                  />
                </Field>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 gold-gradient text-white"
                    onClick={saveClient}
                  >
                    <Save className="mr-1 h-4 w-4" /> Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClient(getClient(id)!);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* QUOTATIONS */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl">Quotations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {quotes.length} total · manage status without deleting.
              </p>
            </div>
            <Link
              to="/quotation/new"
              search={{ clientId: id }}
            >
              <Button className="gold-gradient text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> New Quotation
              </Button>
            </Link>
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl">No quotations yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create the first quotation for this client.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((q) => {
                const thumb =
                  q.imageFront ||
                  q.imagePerspective ||
                  q.imageSide ||
                  q.imageTop;
                return (
                  <div
                    key={q.id}
                    className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={q.quoteNo}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{q.quoteNo}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLE[q.status]}`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {q.jewelryType} · {q.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-semibold text-primary">
                        {q.totalPrice}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {q.currency}
                      </div>
                    </div>
                    <Select
                      value={q.status}
                      onValueChange={(v) =>
                        setStatus(q.id, v as QuotationStatus)
                      }
                    >
                      <SelectTrigger className="w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUOTATION_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Link to="/quotation/$id" params={{ id: q.id }}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-4 w-4" /> Open
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Permanently delete ${q.quoteNo}?`)) {
                          remove(q.id);
                          setQuotes(listByClient(id));
                          toast.success("Quotation deleted");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
