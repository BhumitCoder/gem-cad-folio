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
import { AppHeader } from "./AppHeader";

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
      <AppHeader
        sticky
        portalLabel="Quotation Builder"
        containerClassName="py-3"
        leftSlot={
          <Link
            to={client ? "/clients/$id" : "/"}
            params={client ? { id: client.id } : undefined as never}
          >
            <Button
              size="sm"
              variant="ghost"
              className="text-primary/80 hover:bg-primary/8 hover:text-primary"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {client ? client.name || "Client" : "Clients"}
            </Button>
          </Link>
        }
        rightSlot={
          <>
            <div className="hidden items-center gap-2 md:flex">
              <span className="font-display text-base text-primary/78">
                {q.quoteNo}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                {q.status}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/20 bg-white/70 text-primary hover:bg-primary/8 hover:text-primary"
              onClick={save}
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button
              size="sm"
              className="gold-gradient text-white hover:opacity-90"
              onClick={download}
              disabled={busy}
            >
              <Download className="mr-2 h-4 w-4" />{" "}
              {busy ? "Generating..." : "Download PDF"}
            </Button>
          </>
        }
      />

      <div className="app-shell-wide grid gap-8 py-8 lg:grid-cols-[480px_1fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <QuotationForm value={q} onChange={setQ} />
        </div>
        <div className="overflow-x-auto">
          <div className="sticky top-20">
            <div className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Live Preview
            </div>
            <div className="origin-top-left scale-[0.82] 2xl:scale-[0.92]">
              <QuotationSheet q={q} innerRef={sheetRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
