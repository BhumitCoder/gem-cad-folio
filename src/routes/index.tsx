import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { isAuthed, logout } from "@/lib/auth";
import {
  loadAllClients,
  removeClient,
  upsertClient,
  blankClient,
  type Client,
} from "@/lib/clients";
import { loadAll, type Quotation } from "@/lib/quotations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Users,
  Trash2,
  LogOut,
  ArrowRight,
  FileText,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  const countByClient = (id: string) =>
    quotes.filter((q) => q.clientId === id).length;

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src="https://starlinkjewels.com/assets/starlink-logo-horizontal-DJzhPoqe.png"
              alt="Starlink Jewels"
              className="h-8 w-auto"
            />
            <div className="hidden h-6 w-px bg-white/15 md:block" />
            <span className="hidden font-display text-sm uppercase tracking-[0.3em] text-white/70 md:block">
              Quotation Portal
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Clients</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage clients and their quotations.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-9"
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
                <Button className="gold-gradient text-white hover:opacity-90">
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
          <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-display text-xl">No clients yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first client to start sending quotations.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to="/clients/$id"
                params={{ id: c.id }}
                className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full gold-gradient text-sm font-semibold text-white">
                    {c.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "?"}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        confirm(
                          `Remove ${c.name}? Their quotations will remain.`,
                        )
                      ) {
                        removeClient(c.id);
                        setClients(loadAllClients());
                      }
                    }}
                    className="rounded p-1.5 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-3 font-display text-lg leading-tight">
                  {c.name}
                </h3>
                {c.company && (
                  <p className="text-xs text-muted-foreground">{c.company}</p>
                )}
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {c.email || "—"}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    {countByClient(c.id)} quotation
                    {countByClient(c.id) === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-primary">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
