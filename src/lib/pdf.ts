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

export async function exportElementToPDF(el: HTMLElement, filename: string) {
  // Render in the main document so app fonts/styles are already loaded.
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

    const width = Math.ceil(clone.scrollWidth);
    const height = Math.ceil(clone.scrollHeight);

    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      logging: false,
      scale: 3,
      useCORS: true,
      allowTaint: true,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Slice the tall canvas into A4 page-sized chunks so each PDF page is sharp
    // and we avoid the negative-offset overflow trick (which causes blurriness).
    const pxPerMm = canvas.width / pageWidth;
    const pageHeightPx = Math.floor(pageHeight * pxPerMm);

    let renderedPx = 0;
    let pageIndex = 0;
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

      const imgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      const imgHeightMm = sliceHeight / pxPerMm;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, imgHeightMm, undefined, "FAST");
      renderedPx += sliceHeight;
      pageIndex += 1;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(stage);
  }
}
