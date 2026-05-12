import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function waitForImages(root: ParentNode) {
  const images = Array.from(root.querySelectorAll("img"));

  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

export async function exportElementToPDF(el: HTMLElement, filename: string) {
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";

  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Could not create PDF document");

    doc.open();
    doc.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }

            body {
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
          </style>
        </head>
        <body></body>
      </html>`);
    doc.close();

    const clone = el.cloneNode(true) as HTMLElement;
    Array.from(clone.querySelectorAll("img")).forEach((img) => {
      const rawSrc = img.getAttribute("src");
      if (rawSrc?.startsWith("/")) {
        img.src = `${window.location.origin}${rawSrc}`;
      }
    });

    doc.body.appendChild(clone);

    if ("fonts" in doc) {
      await (doc as Document & { fonts: FontFaceSet }).fonts.ready;
    }
    await waitForImages(doc);

    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      logging: false,
      scale: 2,
      useCORS: true,
      windowWidth: clone.scrollWidth,
      windowHeight: clone.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}
