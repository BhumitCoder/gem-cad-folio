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

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

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
          backgroundColor: BRAND_BORDER,
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
          backgroundColor: BRAND_BORDER,
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
  const customerRows = [
    ["Customer Name", q.customerName],
    ["Email", q.customerEmail],
    ["Sales Executive", q.salesExecutive],
    ["Sales Email", q.salesEmail],
  ].filter(([, value]) => hasText(value));

  const imageRows = [
    { src: q.imageFront, label: "Front View" },
    { src: q.imageSide, label: "Side View" },
    { src: q.imageTop, label: "Top View" },
    { src: q.imagePerspective, label: "Perspective" },
  ].filter((item) => hasText(item.src));

  const specRows = [
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
  ].filter(([, value]) => hasText(value));

  const diamondRows = q.diamonds.filter(
    (diamond) =>
      hasText(diamond.shape) ||
      hasText(diamond.size) ||
      diamond.qty > 0 ||
      diamond.totalWeight > 0,
  );

  const priceRows = q.prices.filter(
    (price) => hasText(price.description) && hasText(price.amount),
  );

  const termRows = q.terms.filter((term) => hasText(term));

  const showQuoteNo = hasText(q.quoteNo);
  const showDate = hasText(q.date);
  const showValidity = hasText(q.validity);
  const showStatus = hasText(q.status);
  const showTotalPrice = hasText(q.totalPrice);
  const showCurrency = hasText(q.currency);
  const showSalesEmail = hasText(q.salesEmail);

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
          padding: "30px 34px 20px",
          backgroundColor: "#f7faff",
          borderBottom: `1px solid ${BRAND_BORDER}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 34,
            right: 34,
            top: 18,
            height: 4,
            borderRadius: 9999,
            backgroundColor: BRAND,
          }}
        />
        <div
          style={{
            position: "relative",
            borderRadius: 28,
            border: `1px solid rgba(47,95,183,0.1)`,
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 18px 40px rgba(24, 54, 124, 0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "0 0 0 auto",
              width: 234,
              backgroundColor: BRAND_DEEP,
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 234px",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                minWidth: 0,
                padding: "30px 28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  minWidth: 0,
                }}
              >
                <img
                  src={LOGO}
                  alt="Starlink Jewels"
                  style={{ height: 72, width: "auto", flexShrink: 0 }}
                />
                <div
                  style={{
                    width: 1,
                    height: 64,
                    backgroundColor: BRAND_BORDER,
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0, maxWidth: 280 }}>
                  <div
                    style={{
                      color: BRAND,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                    }}
                  >
                    Starlink Jewels
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: BRAND_DEEP,
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: 31,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      lineHeight: 1.02,
                    }}
                  >
                    Quotation
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      color: SUBTEXT,
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                    }}
                  >
                    Custom Jewelry Proposal
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                position: "relative",
                minWidth: 0,
                padding: "28px 24px 24px",
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {showQuoteNo ? (
                <div
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                  }}
                >
                  Quote No.
                </div>
              ) : null}
              {showQuoteNo ? (
                <div
                  style={{
                    marginTop: 10,
                    color: "#ffffff",
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    lineHeight: 1.08,
                    wordBreak: "break-word",
                  }}
                >
                  {q.quoteNo}
                </div>
              ) : null}
              {showDate ? (
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.78)",
                    marginTop: showQuoteNo ? 12 : 0,
                  }}
                >
                  {q.date}
                </div>
              ) : null}
              {showValidity || showStatus ? (
                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 18,
                    borderTop: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  {showValidity ? (
                    <div
                      style={{
                        color: "rgba(255,255,255,0.68)",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                      }}
                    >
                      Validity
                    </div>
                  ) : null}
                  <div
                    style={{
                      marginTop: showValidity ? 6 : 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    {showValidity ? (
                      <span
                        style={{
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {q.validity}
                      </span>
                    ) : <span />}
                    {showStatus ? (
                      <span
                        style={{
                          borderRadius: 9999,
                          backgroundColor: "rgba(255,255,255,0.14)",
                          padding: "7px 12px",
                          color: "#ffffff",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                        }}
                      >
                        {q.status}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 44px" }}>
        {customerRows.length ? (
          <>
            <SectionTitle>Customer Details</SectionTitle>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <tbody>
                {customerRows.map(([label, value]) => (
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
          </>
        ) : null}

        {imageRows.length ? (
          <>
            <SectionTitle>Product Preview / 4 View CAD</SectionTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(imageRows.length, 4)}, minmax(0, 1fr))`,
                gap: 16,
              }}
            >
              {imageRows.map((image) => (
                <ImageBox key={image.label} src={image.src} label={image.label} />
              ))}
            </div>
          </>
        ) : null}

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
                backgroundColor: BRAND,
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

        {specRows.length ? (
          <>
            <SectionTitle>Jewelry Specifications</SectionTitle>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <tbody>
                {specRows.map(([label, value], index) => (
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
          </>
        ) : null}

        {diamondRows.length ? (
          <>
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
                {diamondRows.map((diamond, index) => (
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
          </>
        ) : null}

        {priceRows.length || showTotalPrice ? (
          <>
            <SectionTitle>Price Breakdown</SectionTitle>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <tbody>
                {priceRows.map((price, index) => (
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
                {showTotalPrice ? (
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
                      {q.totalPrice} {showCurrency ? q.currency : ""}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </>
        ) : null}

        {termRows.length ? (
          <>
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
              {termRows.map((term, index) => (
                <li key={index} style={{ display: "flex", gap: 8 }}>
                  <span style={{ color: BRAND }}>*</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

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
          backgroundColor: BRAND_DEEP,
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
            {showSalesEmail ? <div>{q.salesEmail}</div> : null}
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
