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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-[#0c0a06] text-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            </Link>
            <span className="font-display text-sm uppercase tracking-[0.3em] text-gold">
              {q.quoteNo}
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={save}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button size="sm" className="gold-gradient text-[#0c0a06] hover:opacity-90" onClick={download} disabled={busy}>
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