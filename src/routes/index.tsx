import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAuthed, logout } from "@/lib/auth";
import { loadAll, remove, type Quotation } from "@/lib/quotations";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Trash2, LogOut, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Quotation[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthed()) {
      navigate({ to: "/login" });
      return;
    }
    setItems(loadAll());
    setReady(true);
  }, [navigate]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-[#0c0a06] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src="https://starlinkjewels.com/assets/starlink-logo-horizontal-DJzhPoqe.png"
              alt="Starlink Jewels"
              className="h-8 w-auto"
            />
            <div className="hidden h-6 w-px bg-white/15 md:block" />
            <span className="hidden font-display text-sm uppercase tracking-[0.3em] text-gold md:block">
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
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl">Quotations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, manage and export client quotations.
            </p>
          </div>
          <Link to="/quotation/new">
            <Button className="gold-gradient text-[#0c0a06] hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" /> New Quotation
            </Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-display text-xl">No quotations yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first quotation to see it here.
            </p>
            <Link to="/quotation/new">
              <Button className="mt-5 gold-gradient text-[#0c0a06]">
                <Plus className="mr-2 h-4 w-4" /> Create Quotation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Quote No.</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((q) => (
                  <tr key={q.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium">{q.quoteNo}</td>
                    <td className="px-5 py-3">{q.customerName || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{q.jewelryType}</td>
                    <td className="px-5 py-3 text-muted-foreground">{q.date}</td>
                    <td className="px-5 py-3 text-right font-semibold">
                      {q.totalPrice} {q.currency}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link to="/quotation/$id" params={{ id: q.id }}>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete ${q.quoteNo}?`)) {
                              remove(q.id);
                              setItems(loadAll());
                              toast.success("Quotation deleted");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
