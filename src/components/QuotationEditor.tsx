import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { QuotationForm } from "./QuotationForm";
import { QuotationSheet } from "./QuotationSheet";
import { upsert, type Quotation } from "@/lib/quotations";
import { exportElementToPDF } from "@/lib/pdf";
import { toast } from "sonner";
import { isAuthed } from "@/lib/auth";
import { getClient } from "@/lib/clients";
import { AppHeader } from "./AppHeader";
import {
  ArrowLeft,
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Gem,
  DollarSign,
} from "lucide-react";

const STEPS = [
  { n: 1 as const, label: "Customer",  hint: "Who is this quote for?",       icon: User },
  { n: 2 as const, label: "Product",   hint: "CAD images & specifications",  icon: Gem },
  { n: 3 as const, label: "Pricing",   hint: "Prices, terms & final review", icon: DollarSign },
];

export function QuotationEditor({ initial }: { initial: Quotation }) {
  const navigate = useNavigate();
  const [q, setQ] = useState<Quotation>(initial);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPreview, setShowPreview] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/login" });
  }, [navigate]);

  useEffect(() => {
    const t = setTimeout(() => upsert(q), 800);
    return () => clearTimeout(t);
  }, [q]);

  const save = () => { upsert(q); toast.success("Saved!"); };

  const download = async () => {
    if (!sheetRef.current) return;
    setBusy(true);
    upsert(q);
    try {
      await exportElementToPDF(sheetRef.current, `${q.quoteNo}-${q.customerName || "quotation"}.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setBusy(false);
    }
  };

  const client = q.clientId ? getClient(q.clientId) : undefined;
  const currentStep = STEPS.find((s) => s.n === step)!;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <AppHeader
        sticky
        portalLabel="Quotation Builder"
        leftSlot={
          <Link
            to={client ? "/clients/$id" : "/"}
            params={client ? { id: client.id } : undefined as never}
          >
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{client ? client.name || "Client" : "Clients"}</span>
              <span className="sm:hidden">Back</span>
            </button>
          </Link>
        }
        rightSlot={
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
              {q.quoteNo}
            </span>
            <button
              onClick={save}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm font-semibold"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={download}
              disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-sm transition disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}
            >
              <Download className="h-4 w-4" />
              <span>{busy ? "Generating..." : "Download PDF"}</span>
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[520px_1fr]">

          {/* Left: Form Panel */}
          <div className="space-y-4">

            {/* Step Indicator */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = s.n === step;
                  const isDone = s.n < step;
                  return (
                    <div key={s.n} className="flex items-center flex-1">
                      <button
                        onClick={() => setStep(s.n)}
                        className={`flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5 transition text-sm font-semibold ${
                          isActive
                            ? "text-white shadow-sm"
                            : isDone
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        }`}
                        style={isActive ? { background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" } : {}}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isActive ? "bg-white/20" : isDone ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-500"
                        }`}>
                          {isDone ? "✓" : s.n}
                        </div>
                        <span className="hidden sm:inline">{s.label}</span>
                        <Icon className="h-3.5 w-3.5 sm:hidden" />
                      </button>
                      {i < STEPS.length - 1 && (
                        <div className={`w-3 h-0.5 mx-1 rounded-full ${isDone ? "bg-emerald-300" : "bg-slate-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-2 px-1">
                <span className="font-medium text-slate-600">{currentStep.label}:</span> {currentStep.hint}
                <span className="ml-2 text-slate-300">· Auto-saved</span>
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <QuotationForm value={q} onChange={setQ} step={step} />

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  disabled={step === 1}
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm disabled:opacity-40 hover:bg-slate-50 transition"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                {step < 3 ? (
                  <button
                    onClick={() => setStep((step + 1) as 1 | 2 | 3)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #1a3a7a 100%)" }}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={download}
                    disabled={busy}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}
                  >
                    <Download className="h-4 w-4" />
                    {busy ? "Generating..." : "Download PDF"}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Preview Toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden w-full py-3 rounded-2xl border-2 border-blue-200 text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 transition"
            >
              {showPreview ? "Hide Preview" : "Show PDF Preview"}
            </button>
          </div>

          {/* Right: Preview */}
          <div className={`${showPreview ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Live PDF Preview</p>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">{q.quoteNo}</span>
              </div>
              <div className="overflow-x-auto rounded-2xl shadow-lg">
                <div className="origin-top-left scale-[0.75] sm:scale-[0.82] 2xl:scale-[0.92]" style={{ width: `${100 / 0.82}%` }}>
                  <QuotationSheet q={q} innerRef={sheetRef} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
