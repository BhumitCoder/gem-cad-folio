import { useRef } from "react";
import type {
  DiamondRow,
  PriceRow,
  Quotation,
  QuotationStatus,
} from "@/lib/quotations";
import { QUOTATION_STATUSES } from "@/lib/quotations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload } from "lucide-react";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
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
        className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-dashed border-border bg-muted/40 transition hover:border-primary"
      >
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-5 w-5" />
            <span className="text-[11px]">Upload</span>
          </div>
        )}
        {value ? (
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
        ) : null}
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
}: {
  value: Quotation;
  onChange: (q: Quotation) => void;
}) {
  const update = (patch: Partial<Quotation>) => {
    onChange({ ...value, ...patch });
  };

  const updateDiamond = (id: string, patch: Partial<DiamondRow>) =>
    update({
      diamonds: value.diamonds.map((diamond) =>
        diamond.id === id ? { ...diamond, ...patch } : diamond,
      ),
    });

  const addDiamond = () =>
    update({
      diamonds: [
        ...value.diamonds,
        {
          id: crypto.randomUUID(),
          shape: "Round",
          size: "",
          qty: 1,
          totalWeight: 0,
        },
      ],
    });

  const removeDiamond = (id: string) =>
    update({ diamonds: value.diamonds.filter((diamond) => diamond.id !== id) });

  const updatePrice = (id: string, patch: Partial<PriceRow>) =>
    update({
      prices: value.prices.map((price) =>
        price.id === id ? { ...price, ...patch } : price,
      ),
    });

  const addPrice = () =>
    update({
      prices: [
        ...value.prices,
        { id: crypto.randomUUID(), description: "", amount: "" },
      ],
    });

  const removePrice = (id: string) =>
    update({ prices: value.prices.filter((price) => price.id !== id) });

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-3 font-display text-lg">Customer & Quote Info</h3>
        <Row>
          <Field label="Quote No.">
            <Input
              value={value.quoteNo}
              onChange={(e) => update({ quoteNo: e.target.value })}
            />
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={value.date}
              onChange={(e) => update({ date: e.target.value })}
            />
          </Field>
          <Field label="Customer Name">
            <Input
              value={value.customerName}
              onChange={(e) => update({ customerName: e.target.value })}
            />
          </Field>
          <Field label="Customer Email">
            <Input
              value={value.customerEmail}
              onChange={(e) => update({ customerEmail: e.target.value })}
            />
          </Field>
          <Field label="Sales Executive">
            <Input
              value={value.salesExecutive}
              onChange={(e) => update({ salesExecutive: e.target.value })}
            />
          </Field>
          <Field label="Sales Email">
            <Input
              value={value.salesEmail}
              onChange={(e) => update({ salesEmail: e.target.value })}
            />
          </Field>
          <Field label="Validity">
            <Input
              value={value.validity}
              onChange={(e) => update({ validity: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <Select
              value={value.status}
              onValueChange={(v) => update({ status: v as QuotationStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Row>
        <div className="mt-3">
          <Field label="Product Photography Link (clickable in PDF)">
            <Input
              placeholder="https://drive.google.com/..."
              value={value.productLink}
              onChange={(e) => update({ productLink: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg">4 View CAD Images</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ImageField
            label="Front View"
            value={value.imageFront}
            onChange={(v) => update({ imageFront: v })}
          />
          <ImageField
            label="Side View"
            value={value.imageSide}
            onChange={(v) => update({ imageSide: v })}
          />
          <ImageField
            label="Top View"
            value={value.imageTop}
            onChange={(v) => update({ imageTop: v })}
          />
          <ImageField
            label="Perspective"
            value={value.imagePerspective}
            onChange={(v) => update({ imagePerspective: v })}
          />
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
                value={value[key] as string}
                onChange={(e) =>
                  update({ [key]: e.target.value } as Partial<Quotation>)
                }
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
          {value.diamonds.map((diamond) => (
            <div key={diamond.id} className="grid grid-cols-12 items-center gap-2">
              <Input
                className="col-span-3"
                placeholder="Shape"
                value={diamond.shape}
                onChange={(e) =>
                  updateDiamond(diamond.id, { shape: e.target.value })
                }
              />
              <Input
                className="col-span-3"
                placeholder="Size"
                value={diamond.size}
                onChange={(e) =>
                  updateDiamond(diamond.id, { size: e.target.value })
                }
              />
              <Input
                className="col-span-2"
                placeholder="Qty"
                type="number"
                value={diamond.qty}
                onChange={(e) =>
                  updateDiamond(diamond.id, { qty: Number(e.target.value) })
                }
              />
              <Input
                className="col-span-3"
                placeholder="Total Weight (CT)"
                type="number"
                step="0.01"
                value={diamond.totalWeight}
                onChange={(e) =>
                  updateDiamond(diamond.id, {
                    totalWeight: Number(e.target.value),
                  })
                }
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="col-span-1"
                onClick={() => removeDiamond(diamond.id)}
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
          {value.prices.map((price) => (
            <div key={price.id} className="grid grid-cols-12 items-center gap-2">
              <Input
                className="col-span-7"
                placeholder="Description"
                value={price.description}
                onChange={(e) =>
                  updatePrice(price.id, { description: e.target.value })
                }
              />
              <Input
                className="col-span-4"
                placeholder="Amount"
                value={price.amount}
                onChange={(e) =>
                  updatePrice(price.id, { amount: e.target.value })
                }
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="col-span-1"
                onClick={() => removePrice(price.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Row>
            <Field label="Total Price">
              <Input
                value={value.totalPrice}
                onChange={(e) => update({ totalPrice: e.target.value })}
              />
            </Field>
            <Field label="Currency">
              <Input
                value={value.currency}
                onChange={(e) => update({ currency: e.target.value })}
              />
            </Field>
          </Row>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg">Terms & Notes</h3>
        <Field label="Terms (one per line)">
          <Textarea
            rows={6}
            value={value.terms.join("\n")}
            onChange={(e) =>
              update({ terms: e.target.value.split("\n").filter(Boolean) })
            }
          />
        </Field>
        <div className="mt-3">
          <Field label="Internal Notes (optional, shown on PDF)">
            <Textarea
              rows={3}
              value={value.notes}
              onChange={(e) => update({ notes: e.target.value })}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
