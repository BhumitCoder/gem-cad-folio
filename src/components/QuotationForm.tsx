import { useRef } from "react";
import type { DiamondRow, PriceRow, Quotation, QuotationStatus } from "@/lib/quotations";
import { QUOTATION_STATUSES } from "@/lib/quotations";
import { Plus, Trash2, Upload, X } from "lucide-react";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold text-slate-700 mb-4 pb-2 border-b-2 border-slate-100">
      {children}
    </h3>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3.5 rounded-xl border-2 border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-400 transition bg-slate-50 placeholder:text-slate-300"
    />
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">{label}</p>
      <div
        onClick={() => !value && ref.current?.click()}
        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
          value
            ? "border-blue-200 cursor-default"
            : "border-dashed border-slate-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50"
        } bg-slate-50`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition shadow-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); ref.current?.click(); }}
              className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition shadow-sm"
            >
              <Upload className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-slate-400">
            <Upload className="h-6 w-6" />
            <span className="text-xs font-medium">Upload</span>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) onChange(await readFileAsDataURL(file));
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function QuotationForm({
  value,
  onChange,
  step,
}: {
  value: Quotation;
  onChange: (q: Quotation) => void;
  step?: 1 | 2 | 3;
}) {
  const update = (patch: Partial<Quotation>) => onChange({ ...value, ...patch });
  const show = (s: 1 | 2 | 3) => step === undefined || step === s;

  const updateDiamond = (id: string, patch: Partial<DiamondRow>) =>
    update({ diamonds: value.diamonds.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  const addDiamond = () =>
    update({ diamonds: [...value.diamonds, { id: crypto.randomUUID(), shape: "", size: "", qty: 1, totalWeight: 0 }] });
  const removeDiamond = (id: string) =>
    update({ diamonds: value.diamonds.filter((d) => d.id !== id) });

  const updatePrice = (id: string, patch: Partial<PriceRow>) =>
    update({ prices: value.prices.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const addPrice = () =>
    update({ prices: [...value.prices, { id: crypto.randomUUID(), description: "", amount: "" }] });
  const removePrice = (id: string) =>
    update({ prices: value.prices.filter((p) => p.id !== id) });

  return (
    <div className="space-y-6">

      {/* ── Step 1: Customer ── */}
      {show(1) && (
        <div className="space-y-4">
          <SectionTitle>Quote Information</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quote Number">
              <TextInput value={value.quoteNo} onChange={(v) => update({ quoteNo: v })} placeholder="SJ-2025-101" />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={value.date}
                onChange={(e) => update({ date: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border-2 border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-400 transition bg-slate-50"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Validity">
              <TextInput value={value.validity} onChange={(v) => update({ validity: v })} placeholder="7 Days" />
            </Field>
            <Field label="Status">
              <select
                value={value.status}
                onChange={(e) => update({ status: e.target.value as QuotationStatus })}
                className="w-full h-11 px-3.5 rounded-xl border-2 border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-400 transition bg-slate-50"
              >
                {QUOTATION_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <SectionTitle>Customer Details</SectionTitle>
            <div className="space-y-3">
              <Field label="Customer Name" required>
                <TextInput value={value.customerName} onChange={(v) => update({ customerName: v })} placeholder="e.g. John Smith" />
              </Field>
              <Field label="Customer Email">
                <TextInput value={value.customerEmail} onChange={(v) => update({ customerEmail: v })} placeholder="customer@email.com" type="email" />
              </Field>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <SectionTitle>Sales Info</SectionTitle>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sales Executive">
                  <TextInput value={value.salesExecutive} onChange={(v) => update({ salesExecutive: v })} placeholder="Your name" />
                </Field>
                <Field label="Sales Email">
                  <TextInput value={value.salesEmail} onChange={(v) => update({ salesEmail: v })} placeholder="sales@email.com" type="email" />
                </Field>
              </div>
              <Field label="Product Photography Link">
                <TextInput value={value.productLink} onChange={(v) => update({ productLink: v })} placeholder="https://drive.google.com/..." />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Product ── */}
      {show(2) && (
        <div className="space-y-6">
          <div>
            <SectionTitle>4-View CAD Images</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ImageField label="Front" value={value.imageFront} onChange={(v) => update({ imageFront: v })} />
              <ImageField label="Side" value={value.imageSide} onChange={(v) => update({ imageSide: v })} />
              <ImageField label="Top" value={value.imageTop} onChange={(v) => update({ imageTop: v })} />
              <ImageField label="Perspective" value={value.imagePerspective} onChange={(v) => update({ imagePerspective: v })} />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <SectionTitle>Jewelry Specifications</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["Jewelry Type", "jewelryType", "e.g. Engagement Ring"],
                ["Metal", "metal", "e.g. 14KT White Gold"],
                ["Gross Weight", "grossWeight", "e.g. 8.25 Grams"],
                ["Net Gold Weight", "netGoldWeight", "e.g. 7.10 Grams"],
                ["Center Stone", "centerStone", "e.g. 3.00 CT Emerald Cut"],
                ["Side Diamonds", "sideDiamonds", "e.g. Round Brilliant"],
                ["Total Diamond Wt.", "totalDiamondWeight", "e.g. 4.20 CT"],
                ["Diamond Quality", "diamondQuality", "e.g. F-G / VS"],
                ["Ring Size", "ringSize", "e.g. US 7"],
                ["Setting Type", "settingType", "e.g. Hidden Halo"],
                ["Polish", "polish", "e.g. High Polish"],
              ] as const).map(([label, key, placeholder]) => (
                <Field key={key} label={label}>
                  <TextInput
                    value={value[key] as string}
                    onChange={(v) => update({ [key]: v } as Partial<Quotation>)}
                    placeholder={placeholder}
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-700">Diamond Breakdown</h3>
              <button
                type="button"
                onClick={addDiamond}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition"
              >
                <Plus className="h-4 w-4" /> Add Row
              </button>
            </div>
            {value.diamonds.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl">No diamond rows yet. Click "Add Row" to add one.</p>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-1.5 px-1">
                  {["Shape", "Size", "Qty", "Weight (CT)", ""].map((h, i) => (
                    <p key={i} className={`text-xs font-semibold text-slate-400 uppercase ${i === 0 ? "col-span-3" : i === 1 ? "col-span-3" : i === 2 ? "col-span-2" : i === 3 ? "col-span-3" : "col-span-1"}`}>{h}</p>
                  ))}
                </div>
                {value.diamonds.map((d) => (
                  <div key={d.id} className="grid grid-cols-12 items-center gap-1.5">
                    <input className="col-span-3 h-10 px-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="Round" value={d.shape} onChange={(e) => updateDiamond(d.id, { shape: e.target.value })} />
                    <input className="col-span-3 h-10 px-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="1.5mm" value={d.size} onChange={(e) => updateDiamond(d.id, { size: e.target.value })} />
                    <input className="col-span-2 h-10 px-2 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-blue-400 bg-slate-50 text-center" type="number" value={d.qty} onChange={(e) => updateDiamond(d.id, { qty: Number(e.target.value) })} />
                    <input className="col-span-3 h-10 px-2.5 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" type="number" step="0.01" placeholder="0.50" value={d.totalWeight} onChange={(e) => updateDiamond(d.id, { totalWeight: Number(e.target.value) })} />
                    <button type="button" onClick={() => removeDiamond(d.id)} className="col-span-1 flex items-center justify-center h-10 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Pricing ── */}
      {show(3) && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-700">Price Breakdown</h3>
              <button
                type="button"
                onClick={addPrice}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition"
              >
                <Plus className="h-4 w-4" /> Add Row
              </button>
            </div>
            {value.prices.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl">No price rows yet. Click "Add Row" to add one.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-1.5 px-1">
                  <p className="col-span-7 text-xs font-semibold text-slate-400 uppercase">Description</p>
                  <p className="col-span-4 text-xs font-semibold text-slate-400 uppercase">Amount</p>
                </div>
                {value.prices.map((p) => (
                  <div key={p.id} className="grid grid-cols-12 items-center gap-1.5">
                    <input className="col-span-7 h-10 px-3 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="e.g. Gold Value" value={p.description} onChange={(e) => updatePrice(p.id, { description: e.target.value })} />
                    <input className="col-span-4 h-10 px-3 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-blue-400 bg-slate-50" placeholder="$0.00" value={p.amount} onChange={(e) => updatePrice(p.id, { amount: e.target.value })} />
                    <button type="button" onClick={() => removePrice(p.id)} className="col-span-1 flex items-center justify-center h-10 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t-2 border-slate-100">
              <Field label="Total Price">
                <TextInput value={value.totalPrice} onChange={(v) => update({ totalPrice: v })} placeholder="$2,840" />
              </Field>
              <Field label="Currency">
                <TextInput value={value.currency} onChange={(v) => update({ currency: v })} placeholder="USD" />
              </Field>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <SectionTitle>Terms & Notes</SectionTitle>
            <Field label="Terms & Conditions (one per line)">
              <textarea
                rows={6}
                value={value.terms.join("\n")}
                onChange={(e) => update({ terms: e.target.value.split("\n").filter(Boolean) })}
                className="w-full px-3.5 py-3 rounded-xl border-2 border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-400 transition bg-slate-50 resize-none"
                placeholder={"Production Time: 10–14 Business Days\nIGI Certification Included\n50% Advance Required"}
              />
            </Field>
            <Field label="Internal Notes (optional, shown on PDF)">
              <textarea
                rows={3}
                value={value.notes}
                onChange={(e) => update({ notes: e.target.value })}
                className="w-full px-3.5 py-3 rounded-xl border-2 border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-blue-400 transition bg-slate-50 resize-none"
                placeholder="Any special notes for this quotation..."
              />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
