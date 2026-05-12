import type { Quotation } from "@/lib/quotations";

const LOGO =
  "https://starlinkjewels.com/assets/starlink-logo-horizontal-DJzhPoqe.png";

const NAVY = "#0a1f4d";
const NAVY_DEEP = "#06122e";
const BRAND = "#2a52a8";
const BRAND_LIGHT = "#eaf0fb";
const BRAND_BORDER = "#cfdbf2";
const TEXT = "#0c1730";
const SUBTEXT = "#3b4a6b";

function ImageBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex flex-col">
      <div
        className="aspect-square w-full overflow-hidden rounded-md border"
        style={{ borderColor: BRAND_BORDER, background: BRAND_LIGHT }}
      >
        {src ? (
          <img
            src={src}
            alt={label}
            crossOrigin="anonymous"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs"
            style={{ color: SUBTEXT }}
          >
            {label}
          </div>
        )}
      </div>
      <div
        className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: BRAND }}
      >
        {label}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 mb-3 flex items-center gap-3">
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(to right, transparent, ${BRAND})`,
        }}
      />
      <h3
        className="font-display text-[15px] font-semibold uppercase tracking-[0.32em]"
        style={{ color: NAVY }}
      >
        {children}
      </h3>
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(to left, transparent, ${BRAND})`,
        }}
      />
    </div>
  );
}

export function QuotationSheet({
  q,
  innerRef,
}: {
  q: Quotation;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={innerRef}
      className="mx-auto w-[794px] bg-white shadow-2xl"
      style={{ fontFamily: "Poppins, sans-serif", color: TEXT }}
    >
      {/* HEADER */}
      <div
        className="relative overflow-hidden px-12 py-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, ${BRAND} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #6b8ad4 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1f3a85 0%, transparent 50%)",
          }}
        />
        <div className="relative flex items-center justify-between gap-6">
          <div className="rounded bg-white px-3 py-2">
            <img
              src={LOGO}
              alt="Starlink Jewels"
              crossOrigin="anonymous"
              className="h-10 w-auto"
            />
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-semibold uppercase tracking-[0.3em] text-white">
              Quotation
            </div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-white/70">
              Custom Jewelry · Lab Diamonds
            </div>
            <div
              className="mt-2 inline-block rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em]"
            >
              Status · {q.status}
            </div>
          </div>
        </div>
      </div>

      {/* META BAR */}
      <div
        className="grid grid-cols-4 gap-0 border-b text-[11px]"
        style={{ background: BRAND_LIGHT, borderColor: BRAND_BORDER }}
      >
        {[
          ["Quote No.", q.quoteNo],
          ["Date", q.date],
          ["Valid", q.validity],
          ["Sales", q.salesExecutive],
        ].map(([k, v]) => (
          <div
            key={k}
            className="border-r px-5 py-3 last:border-r-0"
            style={{ borderColor: BRAND_BORDER }}
          >
            <div
              className="font-semibold uppercase tracking-[0.2em]"
              style={{ color: BRAND }}
            >
              {k}
            </div>
            <div className="mt-1 text-[13px]" style={{ color: TEXT }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      <div className="px-12 py-6">
        {/* CUSTOMER */}
        <SectionTitle>Customer Details</SectionTitle>
        <table className="w-full border-collapse text-[12px]">
          <tbody>
            {[
              ["Customer Name", q.customerName || "—"],
              ["Email", q.customerEmail || "—"],
              ["Sales Executive", q.salesExecutive],
              ["Sales Email", q.salesEmail],
            ].map(([k, v]) => (
              <tr
                key={k}
                className="border-b"
                style={{ borderColor: BRAND_BORDER }}
              >
                <td
                  className="w-1/3 py-2 pr-4 font-semibold"
                  style={{ color: BRAND }}
                >
                  {k}
                </td>
                <td className="py-2" style={{ color: TEXT }}>
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* IMAGES */}
        <SectionTitle>Product Preview · 4 View CAD</SectionTitle>
        <div className="grid grid-cols-4 gap-4">
          <ImageBox src={q.imageFront} label="Front View" />
          <ImageBox src={q.imageSide} label="Side View" />
          <ImageBox src={q.imageTop} label="Top View" />
          <ImageBox src={q.imagePerspective} label="Perspective" />
        </div>

        {/* PRODUCT LINK */}
        {q.productLink && (
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-md border px-4 py-3 text-[12px]"
            style={{
              background: BRAND_LIGHT,
              borderColor: BRAND_BORDER,
            }}
          >
            <div>
              <div
                className="font-semibold uppercase tracking-[0.2em]"
                style={{ color: BRAND, fontSize: 10 }}
              >
                Product Photography
              </div>
              <div className="mt-0.5" style={{ color: SUBTEXT }}>
                Click to view high-resolution product photos
              </div>
            </div>
            <a
              href={q.productLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white"
              style={{
                background: `linear-gradient(135deg, ${BRAND}, ${NAVY})`,
              }}
            >
              View Product
            </a>
          </div>
        )}

        {/* SPECS */}
        <SectionTitle>Jewelry Specifications</SectionTitle>
        <table className="w-full border-collapse text-[12px]">
          <tbody>
            {[
              ["Jewelry Type", q.jewelryType],
              ["Metal", q.metal],
              ["Gross Weight", q.grossWeight],
              ["Net Gold Weight", q.netGoldWeight],
              ["Center Stone", q.centerStone],
              ["Side Diamonds", q.sideDiamonds],
              ["Total Diamond Weight", q.totalDiamondWeight],
              ["Diamond Quality", q.diamondQuality],
              ["Ring Size", q.ringSize],
              ["Setting Type", q.settingType],
              ["Polish", q.polish],
            ].map(([k, v], i) => (
              <tr
                key={k}
                style={{ background: i % 2 ? BRAND_LIGHT : "transparent" }}
              >
                <td
                  className="w-1/3 px-3 py-2 font-semibold"
                  style={{ color: BRAND }}
                >
                  {k}
                </td>
                <td className="px-3 py-2" style={{ color: TEXT }}>
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* DIAMOND BREAKDOWN */}
        <SectionTitle>Diamond Breakdown</SectionTitle>
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr style={{ background: NAVY, color: "#fff" }}>
              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.15em]">
                Shape
              </th>
              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.15em]">
                Size
              </th>
              <th className="px-3 py-2 text-right font-semibold uppercase tracking-[0.15em]">
                Qty
              </th>
              <th className="px-3 py-2 text-right font-semibold uppercase tracking-[0.15em]">
                Total Weight
              </th>
            </tr>
          </thead>
          <tbody>
            {q.diamonds.map((d, i) => (
              <tr
                key={d.id}
                style={{ background: i % 2 ? BRAND_LIGHT : "transparent" }}
              >
                <td className="px-3 py-2">{d.shape}</td>
                <td className="px-3 py-2">{d.size}</td>
                <td className="px-3 py-2 text-right">{d.qty}</td>
                <td className="px-3 py-2 text-right">{d.totalWeight} CT</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PRICE */}
        <SectionTitle>Price Breakdown</SectionTitle>
        <table className="w-full border-collapse text-[12px]">
          <tbody>
            {q.prices.map((p, i) => (
              <tr
                key={p.id}
                style={{ background: i % 2 ? BRAND_LIGHT : "transparent" }}
              >
                <td className="px-3 py-2" style={{ color: TEXT }}>
                  {p.description}
                </td>
                <td className="px-3 py-2 text-right font-medium">{p.amount}</td>
              </tr>
            ))}
            <tr style={{ background: NAVY, color: "#fff" }}>
              <td className="px-3 py-3 font-display text-[15px] uppercase tracking-[0.25em]">
                Total Price
              </td>
              <td className="px-3 py-3 text-right font-display text-[18px] font-semibold">
                {q.totalPrice} {q.currency}
              </td>
            </tr>
          </tbody>
        </table>

        {/* TERMS */}
        <SectionTitle>Terms &amp; Conditions</SectionTitle>
        <ul
          className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px]"
          style={{ color: TEXT }}
        >
          {q.terms.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: BRAND }}>◆</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>

        {q.notes && (
          <>
            <SectionTitle>Notes</SectionTitle>
            <p
              className="whitespace-pre-wrap text-[12px]"
              style={{ color: TEXT }}
            >
              {q.notes}
            </p>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div
        className="mt-4 px-12 py-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${NAVY_DEEP}, ${NAVY})`,
        }}
      >
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="font-display text-lg font-semibold tracking-[0.25em] text-white">
              STARLINK JEWELS
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
              Custom Manufacturing · Lab Grown Diamonds · Worldwide Shipping
            </div>
          </div>
          <div className="text-right text-[10.5px] text-white/70">
            <div>starlinkjewels.com</div>
            <div>@starlinkjewels</div>
            <div>{q.salesEmail}</div>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">
            Authorized Signature
          </div>
          <div className="h-12 w-48 border-b border-white/40" />
        </div>
      </div>
    </div>
  );
}
