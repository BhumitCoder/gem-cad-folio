import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Download } from "lucide-react";
import { QuotationForm } from "./QuotationForm";
import { QuotationSheet } from "./QuotationSheet";
import { upsert, type Quotation } from "@/lib/quotations";
import { exportElementToPDF } from "@/lib/pdf";
import { toast } from "sonner";
import { isAuthed } from "@/lib/auth";
import { getClient } from "@/lib/clients";

export function QuotationEditor({ initial }: { initial: Quotation }) {
  const navigate = useNavigate();
  const [q, setQ] = useState<Quotation>(initial);
  const [busy, setBusy] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/login" });
  }, [navigate]);

  const save = () => {
    upsert(q);
    toast.success("Quotation saved");
  };

  const download = async () => {
    if (!sheetRef.current) return;
    setBusy(true);
    upsert(q);
    try {
      await exportElementToPDF(sheetRef.current, `${q.quoteNo}-${q.customerName || "quotation"}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  };

  const client = q.clientId ? getClient(q.clientId) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-ink text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link
              to={client ? "/clients/$id" : "/"}
              params={client ? { id: client.id } : undefined as never}
            >
              <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
                <ArrowLeft className="mr-1 h-4 w-4" />
                {client ? client.name || "Client" : "Clients"}
              </Button>
            </Link>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-white/70">
              {q.quoteNo}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
              {q.status}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={save}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button size="sm" className="gold-gradient text-white hover:opacity-90" onClick={download} disabled={busy}>
              <Download className="mr-2 h-4 w-4" /> {busy ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-8 lg:grid-cols-[480px_1fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <QuotationForm value={q} onChange={setQ} />
        </div>
        <div className="overflow-x-auto">
          <div className="sticky top-20">
            <div className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Live Preview
            </div>
            <div className="origin-top-left scale-[0.85] xl:scale-100">
              <QuotationSheet q={q} innerRef={sheetRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}