import type { CSSProperties } from "react";

import type { Quotation } from "@/lib/quotations";

const LOGO = "/starlink-jewels-logo.png";

const BRAND = "#2f5fb7";
const BRAND_DEEP = "#173a86";
const BRAND_SOFT = "#eef4ff";
const BRAND_BORDER = "#cbdaf8";
const TEXT = "#0f234d";
const SUBTEXT = "#4f6491";

const cardStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  boxShadow: "0 24px 60px rgba(23, 58, 134, 0.12)",
};

function ImageBox({ src, label }: { src: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          aspectRatio: "1 / 1",
          width: "100%",
          overflow: "hidden",
          borderRadius: 12,
          border: `1px solid ${BRAND_BORDER}`,
          backgroundColor: BRAND_SOFT,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={label}
            crossOrigin="anonymous"
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              color: SUBTEXT,
              fontSize: 12,
            }}
          >
            {label}
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 6,
          textAlign: "center",
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: BRAND,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 24,
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(to right, transparent, ${BRAND})`,
        }}
      />
      <h3
        style={{
          margin: 0,
          color: TEXT,
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 15,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.32em",
        }}
      >
        {children}
      </h3>
      <div
        style={{
          height: 1,
          flex: 1,
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
      style={{
        ...cardStyle,
        margin: "0 auto",
        width: 794,
        color: TEXT,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "30px 34px 22px",
          background:
            "linear-gradient(180deg, #fbfdff 0%, #f2f7ff 52%, #edf4ff 100%)",
          borderBottom: `1px solid ${BRAND_BORDER}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(47,95,183,0.14) 0%, transparent 34%), radial-gradient(circle at 82% 18%, rgba(47,95,183,0.12) 0%, transparent 28%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              minWidth: 0,
              flex: 1,
              borderRadius: 24,
              border: `1px solid rgba(47,95,183,0.12)`,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,246,255,0.94))",
              padding: "24px 24px 22px",
            }}
          >
            <img src={LOGO} alt="Starlink Jewels" style={{ height: 66, width: "auto" }} />
            <div
              style={{
                width: 1,
                height: 62,
                backgroundColor: BRAND_BORDER,
              }}
            />
            <div>
              <div
                style={{
                  color: BRAND_DEEP,
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                Quotation
              </div>
              <div
                style={{
                  marginTop: 6,
                  color: SUBTEXT,
                  fontSize: 11,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                }}
              >
                Custom Jewelry / Lab Diamonds
              </div>
              <div
                style={{
                  marginTop: 14,
                  color: BRAND,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Crafted proposal for premium jewelry presentation
              </div>
            </div>
          </div>

          <div
            style={{
              minWidth: 240,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${BRAND_DEEP}, ${BRAND})`,
              padding: "22px 22px 20px",
              textAlign: "right",
              boxShadow: "0 18px 36px rgba(23, 58, 134, 0.18)",
            }}
          >
            <div
              style={{
                color: "rgba(255,255,255,0.68)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
              }}
            >
              Quote Reference
            </div>
            <div
              style={{
                marginTop: 10,
                color: "#ffffff",
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {q.quoteNo}
            </div>
            <div
              style={{
                marginTop: 10,
                color: "rgba(255,255,255,0.78)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              {q.date} / {q.validity}
            </div>
            <div
              style={{
                marginTop: 18,
                display: "inline-block",
                borderRadius: 9999,
                backgroundColor: "rgba(255,255,255,0.14)",
                padding: "7px 16px",
                color: "#ffffff",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
              }}
            >
              Status / {q.status}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          borderBottom: `1px solid ${BRAND_BORDER}`,
          backgroundColor: BRAND_SOFT,
          fontSize: 11,
        }}
      >
        {[
          ["Quote No.", q.quoteNo],
          ["Date", q.date],
          ["Valid", q.validity],
          ["Sales", q.salesExecutive],
        ].map(([label, value], index) => (
          <div
            key={label}
            style={{
              padding: "14px 24px",
              borderRight: index === 3 ? "none" : `1px solid ${BRAND_BORDER}`,
            }}
          >
            <div
              style={{
                color: BRAND,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              {label}
            </div>
            <div style={{ marginTop: 6, color: TEXT, fontSize: 13 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "24px 44px" }}>
        <SectionTitle>Customer Details</SectionTitle>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <tbody>
            {[
              ["Customer Name", q.customerName || "-"],
              ["Email", q.customerEmail || "-"],
              ["Sales Executive", q.salesExecutive],
              ["Sales Email", q.salesEmail],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: `1px solid ${BRAND_BORDER}` }}>
                <td
                  style={{
                    width: "33.333%",
                    padding: "10px 16px 10px 0",
                    color: BRAND,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </td>
                <td style={{ padding: "10px 0", color: TEXT }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle>Product Preview / 4 View CAD</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          <ImageBox src={q.imageFront} label="Front View" />
          <ImageBox src={q.imageSide} label="Side View" />
          <ImageBox src={q.imageTop} label="Top View" />
          <ImageBox src={q.imagePerspective} label="Perspective" />
        </div>

        {q.productLink ? (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              borderRadius: 12,
              border: `1px solid ${BRAND_BORDER}`,
              backgroundColor: BRAND_SOFT,
              padding: "14px 16px",
              fontSize: 12,
            }}
          >
            <div>
              <div
                style={{
                  color: BRAND,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Product Photography
              </div>
              <div style={{ marginTop: 4, color: SUBTEXT }}>
                Click to view high-resolution product photos
              </div>
            </div>
            <a
              href={q.productLink}
              target="_blank"
              rel="noreferrer"
              style={{
                borderRadius: 10,
                background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DEEP})`,
                padding: "10px 16px",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              View Product
            </a>
          </div>
        ) : null}

        <SectionTitle>Jewelry Specifications</SectionTitle>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
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
            ].map(([label, value], index) => (
              <tr
                key={label}
                style={{
                  backgroundColor: index % 2 ? BRAND_SOFT : "transparent",
                }}
              >
                <td
                  style={{
                    width: "33.333%",
                    padding: "10px 12px",
                    color: BRAND,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </td>
                <td style={{ padding: "10px 12px", color: TEXT }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle>Diamond Breakdown</SectionTitle>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: BRAND_DEEP, color: "#ffffff" }}>
              {["Shape", "Size", "Qty", "Total Weight"].map((label, index) => (
                <th
                  key={label}
                  style={{
                    padding: "10px 12px",
                    textAlign: index < 2 ? "left" : "right",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.diamonds.map((diamond, index) => (
              <tr
                key={diamond.id}
                style={{
                  backgroundColor: index % 2 ? BRAND_SOFT : "transparent",
                }}
              >
                <td style={{ padding: "10px 12px" }}>{diamond.shape}</td>
                <td style={{ padding: "10px 12px" }}>{diamond.size}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {diamond.qty}
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  {diamond.totalWeight} CT
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <SectionTitle>Price Breakdown</SectionTitle>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <tbody>
            {q.prices.map((price, index) => (
              <tr
                key={price.id}
                style={{
                  backgroundColor: index % 2 ? BRAND_SOFT : "transparent",
                }}
              >
                <td style={{ padding: "10px 12px", color: TEXT }}>
                  {price.description}
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  {price.amount}
                </td>
              </tr>
            ))}
            <tr style={{ backgroundColor: BRAND_DEEP, color: "#ffffff" }}>
              <td
                style={{
                  padding: "14px 12px",
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                }}
              >
                Total Price
              </td>
              <td
                style={{
                  padding: "14px 12px",
                  textAlign: "right",
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {q.totalPrice} {q.currency}
              </td>
            </tr>
          </tbody>
        </table>

        <SectionTitle>Terms & Conditions</SectionTitle>
        <ul
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            columnGap: 24,
            rowGap: 6,
            color: TEXT,
            fontSize: 11.5,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {q.terms.map((term, index) => (
            <li key={index} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: BRAND }}>*</span>
              <span>{term}</span>
            </li>
          ))}
        </ul>

        {q.notes ? (
          <>
            <SectionTitle>Notes</SectionTitle>
            <p
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 12,
                color: TEXT,
              }}
            >
              {q.notes}
            </p>
          </>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "24px 44px",
          background: `linear-gradient(135deg, ${BRAND_DEEP}, ${BRAND})`,
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.25em",
              }}
            >
              STARLINK JEWELS
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 10,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Custom Manufacturing / Lab Grown Diamonds / Worldwide Shipping
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: 10.5,
              color: "rgba(255,255,255,0.78)",
            }}
          >
            <div>starlinkjewels.com</div>
            <div>@starlinkjewels</div>
            <div>{q.salesEmail}</div>
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Authorized Signature
          </div>
          <div
            style={{
              height: 48,
              width: 192,
              borderBottom: "1px solid rgba(255,255,255,0.45)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
