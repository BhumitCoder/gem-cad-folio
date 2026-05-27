import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/login" });
  }, [navigate]);

  // Auto-save 800ms after the last edit so the user never loses work.
  useEffect(() => {
    const t = setTimeout(() => upsert(q), 800);
    return () => clearTimeout(t);
  }, [q]);

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

  const steps: { n: 1 | 2 | 3; label: string; hint: string }[] = [
    { n: 1, label: "1. Customer", hint: "Who is this quote for" },
    { n: 2, label: "2. Product", hint: "CAD images & specifications" },
    { n: 3, label: "3. Pricing", hint: "Price breakdown & terms" },
  ];

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
        <div className="space-y-4">
          {/* Step tabs */}
          <div className="flex gap-2 rounded-full border border-border bg-card p-1">
            {steps.map((s) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setStep(s.n)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition ${
                  step === s.n
                    ? "gold-gradient text-white shadow-sm"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="px-1 text-xs text-muted-foreground">
            {steps.find((s) => s.n === step)?.hint} · auto-saved
          </p>

          <div className="rounded-xl border border-border bg-card p-6">
            <QuotationForm value={q} onChange={setQ} step={step} />

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={step === 1}
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {step < 3 ? (
                <Button
                  size="sm"
                  className="gold-gradient text-white"
                  onClick={() => setStep((step + 1) as 1 | 2 | 3)}
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gold-gradient text-white"
                  onClick={download}
                  disabled={busy}
                >
                  <Download className="mr-1 h-4 w-4" />
                  {busy ? "Generating..." : "Download PDF"}
                </Button>
              )}
            </div>
          </div>
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
