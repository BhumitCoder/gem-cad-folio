import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isAuthed, logout } from "@/lib/auth";
import {
  blankClient,
  loadAllClients,
  removeClient,
  upsertClient,
  type Client,
} from "@/lib/clients";
import {
  loadAll,
  QUOTATION_STATUSES,
  type Quotation,
  type QuotationStatus,
} from "@/lib/quotations";
import {
  ArrowRight,
  FileText,
  Globe2,
  LogOut,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Client>(blankClient());
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/login" });
      return;
    }
    setClients(loadAllClients());
    setQuotes(loadAll());
    setReady(true);
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

  const stats = useMemo(() => {
    const activeCountries = new Set(
      clients.map((client) => client.country.trim()).filter(Boolean),
    ).size;

    const statusCounts = QUOTATION_STATUSES.reduce(
      (acc, status) => {
        acc[status] = quotes.filter((quote) => quote.status === status).length;
        return acc;
      },
      {} as Record<QuotationStatus, number>,
    );

    return {
      activeCountries,
      draftCount: statusCounts.Draft,
      sentCount: statusCounts.Sent + statusCounts["Needs Changes"],
      approvedCount: statusCounts.Approved + statusCounts.Completed,
    };
  }, [clients, quotes]);

  const recentQuotes = useMemo(
    () => [...quotes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [quotes],
  );

  const countByClient = (id: string) =>
    quotes.filter((q) => q.clientId === id).length;

  const latestQuoteForClient = (id: string) =>
    quotes
      .filter((quote) => quote.clientId === id)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0];

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        portalLabel="Quotation Portal"
        rightSlot={
          <Button
            variant="ghost"
            size="sm"
            className="text-primary/80 hover:bg-primary/8 hover:text-primary"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        }
      />

      <main className="app-shell py-8 sm:py-10">
        <section className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-white px-6 py-7 shadow-[0_30px_80px_rgba(30,74,150,0.08)] sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(67,110,191,0.16),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(67,110,191,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,247,255,0.94))]" />
          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-primary/70">
                <Sparkles className="h-3.5 w-3.5" />
                Sales Workspace
              </div>
              <h1 className="mt-5 font-display text-5xl leading-none text-foreground sm:text-6xl">
                Clients and quotations in one calm place.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Track every client, monitor quotation progress, and jump into active
                work without the page feeling crowded as your list grows.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
              <StatCard
                label="Total Clients"
                value={clients.length}
                detail="Accounts in your workspace"
                icon={Users}
              />
              <StatCard
                label="Live Quotations"
                value={quotes.length}
                detail="Drafts, sent, approved"
                icon={FileText}
              />
              <StatCard
                label="Countries"
                value={stats.activeCountries}
                detail="Active client locations"
                icon={Globe2}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-4">
          <SummaryTile
            title="Needs Attention"
            value={stats.draftCount}
            note="Draft quotations waiting to be finalized."
          />
          <SummaryTile
            title="In Review"
            value={stats.sentCount}
            note="Sent or revision-stage quotations."
          />
          <SummaryTile
            title="Approved Pipeline"
            value={stats.approvedCount}
            note="Approved and completed work in progress."
          />
          <SummaryTile
            title="Search Results"
            value={filtered.length}
            note={
              search.trim()
                ? "Filtered client matches in the current view."
                : "Visible clients ready to open."
            }
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
          <div className="rounded-[28px] border border-primary/10 bg-white p-4 shadow-[0_24px_60px_rgba(30,74,150,0.06)] sm:p-5">
            <div className="flex flex-col gap-4 border-b border-primary/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-3xl text-foreground">
                  Client Workspace
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A scrollable view built to stay manageable as your client list grows.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-full border-primary/10 bg-background pl-9 shadow-none sm:w-72"
                  />
                </div>
                <Dialog
                  open={open}
                  onOpenChange={(o) => {
                    setOpen(o);
                    if (o) setDraft(blankClient());
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="gold-gradient h-11 rounded-full px-5 text-white hover:opacity-90">
                      <Plus className="mr-2 h-4 w-4" /> New Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-display text-2xl">
                        Create Client
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                      <Field label="Customer Name">
                        <Input
                          value={draft.name}
                          onChange={(e) =>
                            setDraft({ ...draft, name: e.target.value })
                          }
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Email">
                          <Input
                            type="email"
                            value={draft.email}
                            onChange={(e) =>
                              setDraft({ ...draft, email: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Phone">
                          <Input
                            value={draft.phone}
                            onChange={(e) =>
                              setDraft({ ...draft, phone: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Company">
                          <Input
                            value={draft.company}
                            onChange={(e) =>
                              setDraft({ ...draft, company: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="Country">
                          <Input
                            value={draft.country}
                            onChange={(e) =>
                              setDraft({ ...draft, country: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                      <Field label="Notes">
                        <Textarea
                          rows={3}
                          value={draft.notes}
                          onChange={(e) =>
                            setDraft({ ...draft, notes: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="gold-gradient text-white"
                        onClick={() => {
                          if (!draft.name.trim()) {
                            toast.error("Customer name required");
                            return;
                          }
                          upsertClient(draft);
                          setClients(loadAllClients());
                          setOpen(false);
                          toast.success("Client created");
                        }}
                      >
                        Save Client
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-5 rounded-[24px] border border-dashed border-primary/15 bg-[linear-gradient(180deg,rgba(245,249,255,0.96),rgba(255,255,255,0.92))] p-16 text-center">
                <Users className="mx-auto h-12 w-12 text-primary/55" />
                <h3 className="mt-5 font-display text-3xl text-foreground">
                  No clients yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Create your first client and this space will turn into a live
                  workspace with recent quotations, status tracking, and quick actions.
                </p>
              </div>
            ) : (
              <div className="mt-5 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {filtered.map((client) => {
                    const quoteCount = countByClient(client.id);
                    const latestQuote = latestQuoteForClient(client.id);
                    return (
                      <Link
                        key={client.id}
                        to="/clients/$id"
                        params={{ id: client.id }}
                        className="group rounded-[24px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f7faff)] p-5 shadow-[0_14px_35px_rgba(30,74,150,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_48px_rgba(30,74,150,0.12)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gold-gradient text-sm font-semibold text-white shadow-sm">
                              {client.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase() || "?"}
                            </div>
                            <div>
                              <h3 className="font-display text-2xl leading-none text-foreground">
                                {client.name}
                              </h3>
                              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-primary/60">
                                {client.company || client.country || "Private Client"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                confirm(
                                  `Remove ${client.name}? Their quotations will remain.`,
                                )
                              ) {
                                removeClient(client.id);
                                setClients(loadAllClients());
                              }
                            }}
                            className="rounded-full p-2 text-muted-foreground opacity-0 transition hover:bg-destructive/8 hover:text-destructive group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-5 grid gap-3 rounded-2xl border border-primary/8 bg-white/80 p-4">
                          <MetricRow
                            label="Contact"
                            value={client.email || client.phone || "Not added"}
                          />
                          <MetricRow
                            label="Country"
                            value={client.country || "Not added"}
                          />
                          <MetricRow
                            label="Quotations"
                            value={`${quoteCount} total`}
                          />
                        </div>

                        <div className="mt-4 rounded-2xl bg-primary/[0.04] p-4">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/65">
                            Latest Activity
                          </p>
                          {latestQuote ? (
                            <>
                              <p className="mt-2 font-medium text-foreground">
                                {latestQuote.quoteNo} · {latestQuote.status}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {latestQuote.jewelryType} · {latestQuote.totalPrice}
                              </p>
                            </>
                          ) : (
                            <p className="mt-2 text-sm text-muted-foreground">
                              No quotations yet for this client.
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-primary/10 pt-4 text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-primary/70" />
                            Open workspace
                          </span>
                          <span className="flex items-center gap-1 font-medium text-primary">
                            View <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-primary/10 bg-white p-5 shadow-[0_24px_60px_rgba(30,74,150,0.06)]">
              <h3 className="font-display text-2xl text-foreground">
                Recent Quotations
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Quick visibility into the latest quotation activity.
              </p>
              <div className="mt-5 space-y-3">
                {recentQuotes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-primary/12 bg-background p-5 text-sm text-muted-foreground">
                    No quotations created yet.
                  </div>
                ) : (
                  recentQuotes.map((quote) => {
                    const owner = clients.find((client) => client.id === quote.clientId);
                    return (
                      <div
                        key={quote.id}
                        className="rounded-2xl border border-primary/8 bg-[linear-gradient(180deg,#ffffff,#f6f9ff)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {quote.quoteNo}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {owner?.name || quote.customerName || "Unknown client"}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                            {quote.status}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{quote.jewelryType}</span>
                          <span>{quote.totalPrice}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-primary/10 bg-[linear-gradient(180deg,rgba(243,248,255,0.96),rgba(255,255,255,0.98))] p-5 shadow-[0_24px_60px_rgba(30,74,150,0.05)]">
              <h3 className="font-display text-2xl text-foreground">
                Team Snapshot
              </h3>
              <div className="mt-4 space-y-4">
                <MiniProgress
                  label="Draft Quotations"
                  value={stats.draftCount}
                  total={Math.max(quotes.length, 1)}
                />
                <MiniProgress
                  label="Sent and Revisions"
                  value={stats.sentCount}
                  total={Math.max(quotes.length, 1)}
                />
                <MiniProgress
                  label="Approved Pipeline"
                  value={stats.approvedCount}
                  total={Math.max(quotes.length, 1)}
                />
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white/88 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/65">
          {label}
        </p>
        <Icon className="h-4 w-4 text-primary/65" />
      </div>
      <p className="mt-3 font-display text-4xl leading-none text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function SummaryTile({
  title,
  value,
  note,
}: {
  title: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-[0_16px_40px_rgba(30,74,150,0.05)]">
      <p className="text-[11px] uppercase tracking-[0.24em] text-primary/60">
        {title}
      </p>
      <p className="mt-3 font-display text-4xl leading-none text-foreground">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] truncate font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function MiniProgress({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const width = Math.min(100, Math.round((value / total) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-primary/8">
        <div
          className="gold-gradient h-2 rounded-full"
          style={{ width: `${width}%` }}
        />
      </div>
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
