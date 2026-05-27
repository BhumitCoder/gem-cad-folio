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
  Eye,
  EyeOff,
} from "lucide-react";
import { useCallback, useLayoutEffect } from "react";

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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* ── Header ── */}
      <AppHeader
        title="Quotation Builder"
        leftSlot={
          <Link
            to={client ? "/clients/$id" : "/"}
            params={client ? { id: client.id } : undefined as never}
            className="header-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{client ? (client.name || "Client") : "Clients"}</span>
            <span className="sm:hidden">Back</span>
          </Link>
        }
        rightSlot={
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-semibold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)" }}>
              {q.quoteNo}
            </span>
            <button onClick={save} className="header-logout-btn">
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={download}
              disabled={busy}
              className="header-action-btn"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{busy ? "Generating…" : "Download PDF"}</span>
            </button>
          </div>
        }
      />

      {/* ── Body: two-column on large screens ── */}
      <div className="flex-1 page-shell py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

          {/* ── LEFT: Form panel ── */}
          <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 space-y-4">

            {/* Step indicator */}
            <div className="card-premium-static p-4">
              <div className="flex gap-1.5">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isActive = s.n === step;
                  const isDone = s.n < step;
                  return (
                    <div key={s.n} className="flex items-center flex-1 gap-1.5">
                      <button
                        onClick={() => setStep(s.n)}
                        className={`flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5 transition text-sm font-semibold ${
                          isActive
                            ? "text-white shadow-md"
                            : isDone
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                        style={isActive ? { background: "linear-gradient(135deg, #0D1E52, #1A3179)" } : {}}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isActive ? "bg-white/20 text-white" :
                          isDone ? "bg-emerald-200 text-emerald-800" :
                          "bg-gray-200 text-gray-500"
                        }`}>
                          {isDone ? "✓" : s.n}
                        </div>
                        <span className="hidden sm:inline">{s.label}</span>
                        <Icon className="h-3.5 w-3.5 sm:hidden" />
                      </button>
                      {i < STEPS.length - 1 && (
                        <div className={`w-4 h-0.5 rounded-full shrink-0 ${isDone ? "bg-emerald-300" : "bg-gray-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2.5 px-1">
                <span className="font-semibold text-navy">{currentStep.label}:</span>{" "}
                {currentStep.hint}
                <span className="ml-2 text-gray-300">· Auto-saved</span>
              </p>
            </div>

            {/* Form */}
            <div className="card-premium-static p-5">
              <QuotationForm value={q} onChange={setQ} step={step} />

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <button
                  disabled={step === 1}
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                  className="btn-outline flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                {step < 3 ? (
                  <button
                    onClick={() => setStep((step + 1) as 1 | 2 | 3)}
                    className="btn-navy flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={download}
                    disabled={busy}
                    className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm disabled:opacity-60"
                  >
                    <Download className="h-4 w-4" />
                    {busy ? "Generating…" : "Download PDF"}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile preview toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden btn-outline w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              {showPreview ? <><EyeOff className="h-4 w-4" /> Hide Preview</> : <><Eye className="h-4 w-4" /> Show PDF Preview</>}
            </button>
          </div>

          {/* ── RIGHT: PDF Preview ── */}
          <div className={`flex-1 min-w-0 ${showPreview ? "block" : "hidden"} lg:block`}>
            <div className="sticky top-20">
              {/* Preview label */}
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-semibold">Live PDF Preview</p>
                <span className="text-xs bg-navy text-white px-2.5 py-1 rounded-lg font-mono font-semibold">
                  {q.quoteNo}
                </span>
              </div>

              {/* Scaled preview container */}
              <PreviewScaler>
                <QuotationSheet q={q} innerRef={sheetRef} />
              </PreviewScaler>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function PreviewScaler({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const rescale = useCallback(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;
    const containerWidth = container.clientWidth;
    const contentWidth = inner.scrollWidth;
    if (contentWidth === 0) return;
    const scale = Math.min(1, containerWidth / contentWidth);
    inner.style.transform = `scale(${scale})`;
    inner.style.transformOrigin = "top left";
    container.style.height = `${inner.scrollHeight * scale}px`;
  }, []);

  useLayoutEffect(() => {
    rescale();
    const ro = new ResizeObserver(rescale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [rescale]);

  return (
    <div ref={containerRef} className="card-premium-static overflow-hidden">
      <div ref={innerRef} className="w-max">
        {children}
      </div>
    </div>
  );
}
