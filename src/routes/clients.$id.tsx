import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Building2,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
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
  useDataRefresh();
  const { id } = Route.useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/login" });
      return;
    }
    const refresh = () => {
      const currentClient = getClient(id);
      if (!currentClient) return;
      setClient(currentClient);
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

  const statusSummary = useMemo(
    () =>
      QUOTATION_STATUSES.map((status) => ({
        status,
        count: quotes.filter((quote) => quote.status === status).length,
      })),
    [quotes],
  );

  if (!client) return null;

  const updateField = (patch: Partial<Client>) => {
    setClient({ ...client, ...patch });
  };

  const saveClient = () => {
    upsertClient(client);
    toast.success("Client updated");
    setEditing(false);
  };

  const setStatus = (quoteId: string, status: QuotationStatus) => {
    const quote = quotes.find((item) => item.id === quoteId);
    if (!quote) return;

    upsert({ ...quote, status });
    setQuotes(listByClient(id));
    toast.success(`Status: ${status}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        portalLabel="Client Workspace"
        leftSlot={
          <Link to="/">
            <Button
              size="sm"
              variant="ghost"
              className="text-primary/80 hover:bg-primary/8 hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Clients
            </Button>
          </Link>
        }
      />

      <main className="app-shell py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-white px-6 py-7 shadow-[0_30px_80px_rgba(30,74,150,0.08)] sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(67,110,191,0.15),transparent_34%),radial-gradient(circle_at_85%_22%,rgba(67,110,191,0.12),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,247,255,0.94))]" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-primary/70">
                <Sparkles className="h-3.5 w-3.5" />
                Client Workspace
              </div>
              <h1 className="mt-5 font-display text-5xl leading-none text-foreground sm:text-6xl">
                {client.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                All quotations for {client.name}. Create a new one or open an existing draft.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
              <HeroStat
                label="Total Quotations"
                value={quotes.length}
                detail="All records for this client"
              />
              <HeroStat
                label="Active Statuses"
                value={statusSummary.filter((item) => item.count > 0).length}
                detail="Distinct progress stages"
              />
              <HeroStat
                label="Latest Quote"
                value={sorted[0]?.quoteNo ?? "—"}
                detail="Most recently updated quotation"
                compact
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[28px] border border-primary/10 bg-white p-6 shadow-[0_24px_60px_rgba(30,74,150,0.06)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl gold-gradient text-base font-semibold text-white shadow-sm">
                  {client.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="font-display text-3xl leading-none text-foreground">
                    {client.name || "—"}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-primary/60">
                    {client.company || client.country || "Private Client"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 rounded-2xl border border-primary/8 bg-[linear-gradient(180deg,#ffffff,#f7faff)] p-4">
                <ContactRow icon={Mail} value={client.email || "No email added"} />
                <ContactRow icon={Phone} value={client.phone || "No phone added"} />
                <ContactRow
                  icon={Building2}
                  value={client.company || "No company added"}
                />
                <ContactRow
                  icon={MapPin}
                  value={client.country || "No country added"}
                />
              </div>

              {client.notes && !editing ? (
                <div className="mt-4 rounded-2xl bg-primary/[0.04] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary/65">
                    Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {client.notes}
                  </p>
                </div>
              ) : null}

              <div className="mt-5">
                {!editing ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-primary/15"
                    onClick={() => setEditing(true)}
                  >
                    Edit Client
                  </Button>
                ) : (
                  <div className="space-y-3">
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
                        className="gold-gradient flex-1 text-white"
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
            </div>
          </aside>

          <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-5">
              {statusSummary.map((item) => (
                <div
                  key={item.status}
                  className="rounded-2xl border border-primary/10 bg-white p-4 shadow-[0_16px_40px_rgba(30,74,150,0.05)]"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-primary/60">
                    {item.status}
                  </p>
                  <p className="mt-3 font-display text-4xl leading-none text-foreground">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-primary/10 bg-white p-5 shadow-[0_24px_60px_rgba(30,74,150,0.06)]">
              <div className="flex flex-col gap-4 border-b border-primary/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="font-display text-3xl text-foreground">
                    Quotations
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This list stays scrollable so large quotation histories remain easy
                    to manage.
                  </p>
                </div>
                <Link to="/quotation/new" search={{ clientId: id }}>
                  <Button className="gold-gradient rounded-full px-5 text-white hover:opacity-90">
                    <Plus className="mr-2 h-4 w-4" /> New Quotation
                  </Button>
                </Link>
              </div>

              {sorted.length === 0 ? (
                <div className="mt-5 rounded-[24px] border border-dashed border-primary/15 bg-[linear-gradient(180deg,rgba(245,249,255,0.96),rgba(255,255,255,0.92))] p-16 text-center">
                  <FileText className="mx-auto h-12 w-12 text-primary/55" />
                  <h3 className="mt-5 font-display text-3xl text-foreground">
                    No quotations yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Create the first quotation for this client and it will appear in
                    this scrollable timeline.
                  </p>
                </div>
              ) : (
                <div className="mt-5 max-h-[calc(100vh-21rem)] space-y-3 overflow-y-auto pr-1">
                  {sorted.map((quote) => {
                    const thumb =
                      quote.imageFront ||
                      quote.imagePerspective ||
                      quote.imageSide ||
                      quote.imageTop;

                    return (
                      <div
                        key={quote.id}
                        className="rounded-[24px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f7faff)] p-4 shadow-[0_14px_35px_rgba(30,74,150,0.05)]"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                          <div className="flex items-center gap-4">
                            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/[0.06]">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={quote.quoteNo}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <FileText className="h-6 w-6 text-primary/45" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-display text-2xl text-foreground">
                                  {quote.quoteNo}
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${STATUS_STYLE[quote.status]}`}
                                >
                                  {quote.status}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {quote.jewelryType} · {quote.date}
                              </p>
                            </div>
                          </div>

                          <div className="grid flex-1 gap-3 md:grid-cols-3 xl:ml-auto xl:max-w-[560px]">
                            <QuoteMetric label="Value" value={quote.totalPrice} />
                            <QuoteMetric label="Currency" value={quote.currency} />
                            <QuoteMetric label="Validity" value={quote.validity} />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-primary/10 pt-4 xl:flex-row xl:items-center xl:justify-between">
                          <Select
                            value={quote.status}
                            onValueChange={(value) =>
                              setStatus(quote.id, value as QuotationStatus)
                            }
                          >
                            <SelectTrigger className="w-full rounded-full border-primary/12 bg-white md:w-[220px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {QUOTATION_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex flex-wrap gap-2">
                            <Link to="/quotation/$id" params={{ id: quote.id }}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full border-primary/15"
                              >
                                <Eye className="mr-1 h-4 w-4" /> Open
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-full text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                              onClick={() => {
                                if (confirm(`Permanently delete ${quote.quoteNo}?`)) {
                                  remove(quote.id);
                                  setQuotes(listByClient(id));
                                  toast.success("Quotation deleted");
                                }
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function HeroStat({
  label,
  value,
  detail,
  compact = false,
}: {
  label: string;
  value: number | string;
  detail: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white/88 p-4 shadow-sm backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.22em] text-primary/65">
        {label}
      </p>
      <p
        className={`mt-3 font-display leading-none text-foreground ${compact ? "text-2xl" : "text-4xl"}`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  value,
}: {
  icon: typeof Mail;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.06] text-primary/70">
        <Icon className="h-4 w-4" />
      </div>
      <span className="truncate">{value}</span>
    </div>
  );
}

function QuoteMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-primary/8 bg-white/90 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60">
        {label}
      </p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
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
