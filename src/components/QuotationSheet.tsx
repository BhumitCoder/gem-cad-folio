import type { Quotation } from "@/lib/quotations";

const LOGO =
  "https://starlinkjewels.com/assets/starlink-logo-horizontal-DJzhPoqe.png";

function ImageBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex flex-col">
      <div className="aspect-square w-full overflow-hidden rounded-md border border-[#e6dcc4] bg-[#fbf7ee]">
        {src ? (
          <img src={src} alt={label} crossOrigin="anonymous" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#a89a78]">
            {label}
          </div>
        )}
      </div>
      <div className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a6a44]">
        {label}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 mb-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#caa86a]" />
      <h3 className="font-display text-[15px] font-semibold uppercase tracking-[0.32em] text-[#7a6a44]">
        {children}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#caa86a]" />
    </div>
  );
}

export function QuotationSheet({ q, innerRef }: { q: Quotation; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={innerRef}
      className="mx-auto w-[794px] bg-white text-[#1a1505] shadow-2xl"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* HEADER */}
      <div className="relative overflow-hidden bg-[#0c0a06] px-12 py-8 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #d4af6a 0%, transparent 50%), radial-gradient(circle at 80% 80%, #c9a04a 0%, transparent 50%)",
          }}
        />
        <div className="relative flex items-center justify-between gap-6">
          <img src={LOGO} alt="Starlink Jewels" crossOrigin="anonymous" className="h-12 w-auto" />
          <div className="text-right">
            <div
              className="font-display text-2xl font-semibold uppercase tracking-[0.3em]"
              style={{ color: "#d4af6a" }}
            >
              Quotation
            </div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-white/70">
              Custom Jewelry • Lab Diamonds
            </div>
          </div>
        </div>
      </div>

      {/* META BAR */}
      <div className="grid grid-cols-4 gap-0 border-b border-[#e6dcc4] bg-[#fbf7ee] text-[11px]">
        {[
          ["Quote No.", q.quoteNo],
          ["Date", q.date],
          ["Valid", q.validity],
          ["Sales", q.salesExecutive],
        ].map(([k, v]) => (
          <div key={k} className="border-r border-[#e6dcc4] px-5 py-3 last:border-r-0">
            <div className="font-semibold uppercase tracking-[0.2em] text-[#7a6a44]">{k}</div>
            <div className="mt-1 text-[13px] text-[#1a1505]">{v}</div>
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
              <tr key={k} className="border-b border-[#efe7d2]">
                <td className="w-1/3 py-2 pr-4 font-semibold text-[#7a6a44]">{k}</td>
                <td className="py-2 text-[#1a1505]">{v}</td>
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
              <tr key={k} className={i % 2 ? "bg-[#fbf7ee]" : ""}>
                <td className="w-1/3 px-3 py-2 font-semibold text-[#7a6a44]">{k}</td>
                <td className="px-3 py-2 text-[#1a1505]">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* DIAMOND BREAKDOWN */}
        <SectionTitle>Diamond Breakdown</SectionTitle>
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-[#0c0a06] text-white">
              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.15em]">Shape</th>
              <th className="px-3 py-2 text-left font-semibold uppercase tracking-[0.15em]">Size</th>
              <th className="px-3 py-2 text-right font-semibold uppercase tracking-[0.15em]">Qty</th>
              <th className="px-3 py-2 text-right font-semibold uppercase tracking-[0.15em]">Total Weight</th>
            </tr>
          </thead>
          <tbody>
            {q.diamonds.map((d, i) => (
              <tr key={d.id} className={i % 2 ? "bg-[#fbf7ee]" : ""}>
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
              <tr key={p.id} className={i % 2 ? "bg-[#fbf7ee]" : ""}>
                <td className="px-3 py-2 text-[#1a1505]">{p.description}</td>
                <td className="px-3 py-2 text-right font-medium">{p.amount}</td>
              </tr>
            ))}
            <tr className="bg-[#0c0a06] text-white">
              <td className="px-3 py-3 font-display text-[15px] uppercase tracking-[0.25em]" style={{ color: "#d4af6a" }}>
                Total Price
              </td>
              <td className="px-3 py-3 text-right font-display text-[18px] font-semibold" style={{ color: "#d4af6a" }}>
                {q.totalPrice} {q.currency}
              </td>
            </tr>
          </tbody>
        </table>

        {/* TERMS */}
        <SectionTitle>Terms & Conditions</SectionTitle>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px] text-[#1a1505]">
          {q.terms.map((t, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: "#caa86a" }}>◆</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>

        {q.notes && (
          <>
            <SectionTitle>Notes</SectionTitle>
            <p className="whitespace-pre-wrap text-[12px] text-[#1a1505]">{q.notes}</p>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-4 bg-[#0c0a06] px-12 py-6 text-white">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="font-display text-lg font-semibold tracking-[0.25em]" style={{ color: "#d4af6a" }}>
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
          <div className="h-12 w-48 border-b border-[#d4af6a]/40" />
        </div>
      </div>
    </div>
  );
}