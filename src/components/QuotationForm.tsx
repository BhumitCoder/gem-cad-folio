import { useRef, useState } from "react";
import type { Quotation, DiamondRow, PriceRow } from "@/lib/quotations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Upload } from "lucide-react";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div
        onClick={() => ref.current?.click()}
        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-dashed border-border bg-muted/40 transition hover:border-gold"
      >
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-5 w-5" />
            <span className="text-[11px]">Upload</span>
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange(await readFileAsDataURL(f));
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function QuotationForm({
  value,
  onChange,
}: {
  value: Quotation;
  onChange: (q: Quotation) => void;
}) {
  const [q, setQ] = useState(value);
  const update = (patch: Partial<Quotation>) => {
    const next = { ...q, ...patch };
    setQ(next);
    onChange(next);
  };

  const updateDiamond = (id: string, patch: Partial<DiamondRow>) =>
    update({ diamonds: q.diamonds.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  const addDiamond = () =>
    update({
      diamonds: [
        ...q.diamonds,
        { id: crypto.randomUUID(), shape: "Round", size: "", qty: 1, totalWeight: 0 },
      ],
    });
  const removeDiamond = (id: string) =>
    update({ diamonds: q.diamonds.filter((d) => d.id !== id) });

  const updatePrice = (id: string, patch: Partial<PriceRow>) =>
    update({ prices: q.prices.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const addPrice = () =>
    update({
      prices: [...q.prices, { id: crypto.randomUUID(), description: "", amount: "" }],
    });
  const removePrice = (id: string) =>
    update({ prices: q.prices.filter((p) => p.id !== id) });

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
  );

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 font-display text-lg">Customer & Quote Info</h3>
        <Row>
          <Field label="Quote No.">
            <Input value={q.quoteNo} onChange={(e) => update({ quoteNo: e.target.value })} />
          </Field>
          <Field label="Date">
            <Input type="date" value={q.date} onChange={(e) => update({ date: e.target.value })} />
          </Field>
          <Field label="Customer Name">
            <Input value={q.customerName} onChange={(e) => update({ customerName: e.target.value })} />
          </Field>
          <Field label="Customer Email">
            <Input value={q.customerEmail} onChange={(e) => update({ customerEmail: e.target.value })} />
          </Field>
          <Field label="Sales Executive">
            <Input value={q.salesExecutive} onChange={(e) => update({ salesExecutive: e.target.value })} />
          </Field>
          <Field label="Sales Email">
            <Input value={q.salesEmail} onChange={(e) => update({ salesEmail: e.target.value })} />
          </Field>
          <Field label="Validity">
            <Input value={q.validity} onChange={(e) => update({ validity: e.target.value })} />
          </Field>
        </Row>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg">4 View CAD Images</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ImageField label="Front View" value={q.imageFront} onChange={(v) => update({ imageFront: v })} />
          <ImageField label="Side View" value={q.imageSide} onChange={(v) => update({ imageSide: v })} />
          <ImageField label="Top View" value={q.imageTop} onChange={(v) => update({ imageTop: v })} />
          <ImageField label="Perspective" value={q.imagePerspective} onChange={(v) => update({ imagePerspective: v })} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg">Jewelry Specifications</h3>
        <Row>
          {([
            ["Jewelry Type", "jewelryType"],
            ["Metal", "metal"],
            ["Gross Weight", "grossWeight"],
            ["Net Gold Weight", "netGoldWeight"],
            ["Center Stone", "centerStone"],
            ["Side Diamonds", "sideDiamonds"],
            ["Total Diamond Weight", "totalDiamondWeight"],
            ["Diamond Quality", "diamondQuality"],
            ["Ring Size", "ringSize"],
            ["Setting Type", "settingType"],
            ["Polish", "polish"],
          ] as const).map(([label, key]) => (
            <Field key={key} label={label}>
              <Input
                value={q[key] as string}
                onChange={(e) => update({ [key]: e.target.value } as Partial<Quotation>)}
              />
            </Field>
          ))}
        </Row>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg">Diamond Breakdown</h3>
          <Button type="button" size="sm" variant="outline" onClick={addDiamond}>
            <Plus className="mr-1 h-4 w-4" /> Add row
          </Button>
        </div>
        <div className="space-y-2">
          {q.diamonds.map((d) => (
            <div key={d.id} className="grid grid-cols-12 items-center gap-2">
              <Input
                className="col-span-3"
                placeholder="Shape"
                value={d.shape}
                onChange={(e) => updateDiamond(d.id, { shape: e.target.value })}
              />
              <Input
                className="col-span-3"
                placeholder="Size"
                value={d.size}
                onChange={(e) => updateDiamond(d.id, { size: e.target.value })}
              />
              <Input
                className="col-span-2"
                placeholder="Qty"
                type="number"
                value={d.qty}
                onChange={(e) => updateDiamond(d.id, { qty: Number(e.target.value) })}
              />
              <Input
                className="col-span-3"
                placeholder="Total Weight (CT)"
                type="number"
                step="0.01"
                value={d.totalWeight}
                onChange={(e) => updateDiamond(d.id, { totalWeight: Number(e.target.value) })}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="col-span-1"
                onClick={() => removeDiamond(d.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg">Price Breakdown</h3>
          <Button type="button" size="sm" variant="outline" onClick={addPrice}>
            <Plus className="mr-1 h-4 w-4" /> Add row
          </Button>
        </div>
        <div className="space-y-2">
          {q.prices.map((p) => (
            <div key={p.id} className="grid grid-cols-12 items-center gap-2">
              <Input
                className="col-span-7"
                placeholder="Description"
                value={p.description}
                onChange={(e) => updatePrice(p.id, { description: e.target.value })}
              />
              <Input
                className="col-span-4"
                placeholder="Amount"
                value={p.amount}
                onChange={(e) => updatePrice(p.id, { amount: e.target.value })}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="col-span-1"
                onClick={() => removePrice(p.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Row>
            <Field label="Total Price">
              <Input value={q.totalPrice} onChange={(e) => update({ totalPrice: e.target.value })} />
            </Field>
            <Field label="Currency">
              <Input value={q.currency} onChange={(e) => update({ currency: e.target.value })} />
            </Field>
          </Row>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg">Terms & Notes</h3>
        <Field label="Terms (one per line)">
          <Textarea
            rows={6}
            value={q.terms.join("\n")}
            onChange={(e) => update({ terms: e.target.value.split("\n").filter(Boolean) })}
          />
        </Field>
        <div className="mt-3">
          <Field label="Internal Notes (optional, shown on PDF)">
            <Textarea rows={3} value={q.notes} onChange={(e) => update({ notes: e.target.value })} />
          </Field>
        </div>
      </section>
    </div>
  );
}