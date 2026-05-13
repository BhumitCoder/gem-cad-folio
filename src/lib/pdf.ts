import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

// ─── Constants ────────────────────────────────────────────────────────────────

const SCALE = 3;

/** A4 dimensions in mm */
const PAGE_W_MM = 210;
const PAGE_H_MM = 297;

/** Page margins in mm */
const MARGIN_TOP_MM = 12;
const MARGIN_BOTTOM_MM = 12;
const MARGIN_SIDE_MM = 10;

/** Gap between sections on the same page (mm) */
const SECTION_GAP_MM = 6;

/**
 * If a section's height is below this fraction of the usable page height,
 * it will be pushed to the next page rather than split across pages.
 * Sections taller than this threshold are sliced across pages.
 *
 * Example: 0.6 means sections up to 60% of page height are kept intact.
 */
const SPLIT_THRESHOLD = 0.6;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function waitForImages(root: ParentNode) {
  const images = Array.from(root.querySelectorAll("img"));
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

function stripEffects(root: HTMLElement) {
  root.style.boxShadow = "none";
  root.style.margin = "0";
  root.style.transform = "none";
  Array.from(root.querySelectorAll<HTMLElement>("*")).forEach((node) => {
    const { style } = node;
    if (style.boxShadow) style.boxShadow = "none";
    if (style.textShadow) style.textShadow = "none";
    if (style.filter) style.filter = "none";
    if (style.backdropFilter) style.backdropFilter = "none";
  });
}

async function renderSection(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    backgroundColor: "#ffffff",
    logging: false,
    scale: SCALE,
    useCORS: true,
    allowTaint: true,
  });
}

/**
 * Slice a canvas vertically and add each slice as a new PDF page.
 */
function addSlicedCanvasToPDF(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  contentWidthMm: number,
  usableHeightMm: number,
  startY: number,
  sideMargin: number,
  topMargin: number,
): number {
  const pxPerMm = canvas.width / contentWidthMm;
  const pageHeightPx = Math.floor(usableHeightMm * pxPerMm);
  let renderedPx = 0;
  let cursorY = startY;
  let firstSlice = true;

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeightPx;

    const ctx = pageCanvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      canvas,
      0, renderedPx, canvas.width, sliceHeightPx,
      0, 0,          canvas.width, sliceHeightPx,
    );

    const sliceHeightMm = sliceHeightPx / pxPerMm;

    if (!firstSlice) {
      pdf.addPage();
      cursorY = topMargin;
    }

    pdf.addImage(
      pageCanvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      sideMargin,
      cursorY,
      contentWidthMm,
      sliceHeightMm,
      undefined,
      "FAST",
    );

    renderedPx += sliceHeightPx;
    cursorY += sliceHeightMm;
    firstSlice = false;
  }

  return cursorY;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function exportElementToPDF(el: HTMLElement, filename: string) {
  // ── 1. Prepare off-screen clone ──────────────────────────────────────────
  const stage = document.createElement("div");
  stage.style.cssText = [
    "position: fixed",
    "left: -10000px",
    "top: 0",
    `width: ${PAGE_W_MM - MARGIN_SIDE_MM * 2}px`, // match content width
    "background: #ffffff",
    "z-index: -1",
    "pointer-events: none",
  ].join(";");

  const clone = el.cloneNode(true) as HTMLElement;
  stripEffects(clone);

  // Fix relative image paths
  Array.from(clone.querySelectorAll("img")).forEach((img) => {
    const rawSrc = img.getAttribute("src");
    if (rawSrc?.startsWith("/")) {
      img.src = `${window.location.origin}${rawSrc}`;
    }
  });

  stage.appendChild(clone);
  document.body.appendChild(stage);

  try {
    // ── 2. Wait for fonts & images ─────────────────────────────────────────
    if ("fonts" in document) {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    }
    await waitForImages(clone);

    // ── 3. Set up PDF ──────────────────────────────────────────────────────
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

    const sideMargin  = MARGIN_SIDE_MM;
    const topMargin   = MARGIN_TOP_MM;
    const bottomMargin = MARGIN_BOTTOM_MM;
    const contentWidthMm = PAGE_W_MM - sideMargin * 2;
    const usableHeightMm = PAGE_H_MM - topMargin - bottomMargin;

    // ── 4. Collect sections ────────────────────────────────────────────────
    const sections = Array.from(
      clone.querySelectorAll<HTMLElement>("[data-pdf-section]"),
    );

    // No sections → render whole element as one block
    if (sections.length === 0) {
      const canvas = await renderSection(clone);
      const totalHeightMm = (canvas.height * contentWidthMm) / canvas.width;

      if (totalHeightMm <= usableHeightMm) {
        // Fits on one page — center it vertically for a clean look
        const verticalOffset = (usableHeightMm - totalHeightMm) / 2;
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          sideMargin,
          topMargin + verticalOffset,
          contentWidthMm,
          totalHeightMm,
          undefined,
          "FAST",
        );
      } else {
        // Slice across pages
        addSlicedCanvasToPDF(
          pdf, canvas, contentWidthMm, usableHeightMm,
          topMargin, sideMargin, topMargin,
        );
      }

      pdf.save(filename);
      return;
    }

    // ── 5. Render each section with smart page-break logic ─────────────────
    let cursorY = topMargin;
    let isFirstOnPage = true;

    for (const section of sections) {
      const canvas = await renderSection(section);
      const sectionHeightMm = (canvas.height * contentWidthMm) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // Add gap between sections (not before the very first on a page)
      const gapBefore = isFirstOnPage ? 0 : SECTION_GAP_MM;
      const spaceNeeded = sectionHeightMm + gapBefore;
      const remaining = PAGE_H_MM - bottomMargin - cursorY;

      // ── Decision: split or push? ────────────────────────────────────────
      const isTall = sectionHeightMm > usableHeightMm * SPLIT_THRESHOLD;

      if (isTall) {
        // Tall section → always slice across pages, starting on a fresh page
        if (!isFirstOnPage) {
          pdf.addPage();
          cursorY = topMargin;
          isFirstOnPage = true;
        }
        cursorY = addSlicedCanvasToPDF(
          pdf, canvas, contentWidthMm, usableHeightMm,
          cursorY, sideMargin, topMargin,
        );
        // After slicing, continue from where we left off (no extra gap here)
        isFirstOnPage = false;
        continue;
      }

      // Short/medium section → keep intact; push to next page if it won't fit
      if (spaceNeeded > remaining && !isFirstOnPage) {
        pdf.addPage();
        cursorY = topMargin;
        isFirstOnPage = true;
      }

      const drawY = isFirstOnPage ? cursorY : cursorY + SECTION_GAP_MM;

      pdf.addImage(
        imgData,
        "JPEG",
        sideMargin,
        drawY,
        contentWidthMm,
        sectionHeightMm,
        undefined,
        "FAST",
      );

      cursorY = drawY + sectionHeightMm;
      isFirstOnPage = false;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(stage);
  }
}
