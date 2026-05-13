import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

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

const SCALE = 3;

async function renderSection(el: HTMLElement) {
  return html2canvas(el, {
    backgroundColor: "#ffffff",
    logging: false,
    scale: SCALE,
    useCORS: true,
    allowTaint: true,
  });
}

export async function exportElementToPDF(el: HTMLElement, filename: string) {
  const stage = document.createElement("div");
  stage.style.position = "fixed";
  stage.style.left = "-10000px";
  stage.style.top = "0";
  stage.style.width = "794px";
  stage.style.background = "#ffffff";
  stage.style.zIndex = "-1";
  stage.style.pointerEvents = "none";

  const clone = el.cloneNode(true) as HTMLElement;
  stripEffects(clone);
  Array.from(clone.querySelectorAll("img")).forEach((img) => {
    const rawSrc = img.getAttribute("src");
    if (rawSrc?.startsWith("/")) {
      img.src = `${window.location.origin}${rawSrc}`;
    }
  });

  stage.appendChild(clone);
  document.body.appendChild(stage);

  try {
    if ("fonts" in document) {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    }
    await waitForImages(clone);

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth(); // 210
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297
    const sideMargin = 0; // sheet already has its own padding
    const topMargin = 0;
    const contentWidth = pageWidth - sideMargin * 2;
    const usableHeight = pageHeight - topMargin * 2;

    const sections = Array.from(
      clone.querySelectorAll<HTMLElement>("[data-pdf-section]"),
    );

    if (sections.length === 0) {
      const canvas = await renderSection(clone);
      const heightMm = (canvas.height * contentWidth) / canvas.width;
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        sideMargin,
        topMargin,
        contentWidth,
        heightMm,
        undefined,
        "FAST",
      );
      pdf.save(filename);
      return;
    }

    let cursorY = topMargin;
    let firstOnPage = true;
    const gapMm = 4;

    for (const section of sections) {
      const canvas = await renderSection(section);
      const sectionHeightMm = (canvas.height * contentWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // If section is taller than a page, slice it across pages.
      if (sectionHeightMm > usableHeight) {
        if (!firstOnPage) {
          pdf.addPage();
          cursorY = topMargin;
          firstOnPage = true;
        }
        const pxPerMm = canvas.width / contentWidth;
        const pageHeightPx = Math.floor(usableHeight * pxPerMm);
        let renderedPx = 0;
        while (renderedPx < canvas.height) {
          const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedPx);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context unavailable");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0, renderedPx, canvas.width, sliceHeight,
            0, 0, canvas.width, sliceHeight,
          );
          const sliceMm = sliceHeight / pxPerMm;
          if (renderedPx > 0) {
            pdf.addPage();
            cursorY = topMargin;
          }
          pdf.addImage(
            pageCanvas.toDataURL("image/jpeg", 0.95),
            "JPEG",
            sideMargin,
            cursorY,
            contentWidth,
            sliceMm,
            undefined,
            "FAST",
          );
          renderedPx += sliceHeight;
          cursorY += sliceMm;
          firstOnPage = false;
        }
        continue;
      }

      const remaining = pageHeight - cursorY;
      if (sectionHeightMm > remaining && !firstOnPage) {
        pdf.addPage();
        cursorY = topMargin;
        firstOnPage = true;
      }

      pdf.addImage(
        imgData,
        "JPEG",
        sideMargin,
        cursorY,
        contentWidth,
        sectionHeightMm,
        undefined,
        "FAST",
      );
      cursorY += sectionHeightMm + gapMm;
      firstOnPage = false;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(stage);
  }
}
