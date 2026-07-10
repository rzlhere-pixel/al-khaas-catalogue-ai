import { jsPDF } from "jspdf";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/catalog";
import { getProductImage } from "@/lib/product-asset-map";

const BRAND = "Al Khaas General Trading";
const INK = { r: 28, g: 20, b: 15 };
const GOLD = { r: 200, g: 160, b: 90 };
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;

function today() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Fetch a same-origin/bundled image and return a PNG/JPEG data URL + intrinsic size. Returns null on any failure. */
async function toDataUrl(url: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const { w, h } = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = dataUrl;
    });
    return { dataUrl, w, h };
  } catch {
    return null;
  }
}

function drawHeader(doc: jsPDF, kicker: string, title: string) {
  doc.setFillColor(INK.r, INK.g, INK.b);
  doc.rect(0, 0, PAGE_W, 24, "F");
  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(BRAND.toUpperCase(), MARGIN, 10);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(kicker.toUpperCase(), MARGIN, 16.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, MARGIN, 21.5);
}

function drawFooter(doc: jsPDF, pageNum: number, pageCount: number) {
  doc.setFontSize(8);
  doc.setTextColor(140, 130, 120);
  doc.setFont("helvetica", "normal");
  doc.text(`${BRAND} · Generated ${today()}`, MARGIN, PAGE_H - 8);
  doc.text(`Page ${pageNum} of ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
}

function finalizeFooters(doc: jsPDF) {
  const count = doc.getNumberOfPages();
  for (let i = 1; i <= count; i++) {
    doc.setPage(i);
    drawFooter(doc, i, count);
  }
}

function fieldRows(p: Product): [string, string][] {
  const rows: [string, string | undefined][] = [
    ["Country of origin", p.origin],
    ["Ingredients", p.ingredients],
    ["Nutrition facts", p.nutrition],
    ["Storage instructions", p.storage],
    ["Shelf life", p.shelfLife],
    ["Carton quantity", p.cartonQty],
  ];
  return rows.filter((r): r is [string, string] => !!r[1] && r[1].trim().length > 0);
}

/** Generates and downloads a single-product spec sheet PDF. */
export async function exportProductSheetPdf(product: Product) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc, "Product Sheet", product.displayName);

  let y = 34;
  const imgBox = { x: MARGIN, y, size: 58 };
  const localUrl = getProductImage(product.id);
  doc.setDrawColor(230, 224, 214);
  doc.setFillColor(250, 248, 244);
  doc.roundedRect(imgBox.x, imgBox.y, imgBox.size, imgBox.size, 3, 3, "FD");

  if (localUrl) {
    const img = await toDataUrl(localUrl);
    if (img) {
      const pad = 4;
      const maxW = imgBox.size - pad * 2;
      const maxH = imgBox.size - pad * 2;
      const scale = Math.min(maxW / img.w, maxH / img.h);
      const w = img.w * scale;
      const h = img.h * scale;
      const format = img.dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(
        img.dataUrl,
        format,
        imgBox.x + (imgBox.size - w) / 2,
        imgBox.y + (imgBox.size - h) / 2,
        w,
        h,
      );
    }
  } else {
    doc.setTextColor(180, 170, 155);
    doc.setFontSize(8);
    doc.text("Image not available", imgBox.x + imgBox.size / 2, imgBox.y + imgBox.size / 2, {
      align: "center",
    });
  }

  const infoX = imgBox.x + imgBox.size + 10;
  let iy = imgBox.y + 6;
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(product.brand.toUpperCase(), infoX, iy);
  iy += 8;
  doc.setFontSize(16);
  const nameLines = doc.splitTextToSize(product.displayName, PAGE_W - infoX - MARGIN);
  doc.text(nameLines, infoX, iy);
  iy += nameLines.length * 6 + 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 80, 70);
  doc.text(product.subtitle, infoX, iy);
  iy += 8;

  const meta: [string, string][] = [
    ["SKU / Item code", product.itemCode],
    ["Barcode", product.barcode || "—"],
    ["Packaging type", product.packaging || "—"],
  ];
  doc.setFontSize(9);
  for (const [k, v] of meta) {
    doc.setTextColor(150, 140, 128);
    doc.text(k, infoX, iy);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(v, infoX + 42, iy);
    iy += 6;
  }

  y = imgBox.y + imgBox.size + 12;

  const prices: [string, number | null][] = [
    ["Case price", product.casePrice],
    ["Outer price", product.outerPrice],
    ["Piece price", product.piecePrice],
  ];
  const filledPrices = prices.filter((pr): pr is [string, number] => pr[1] != null);
  if (filledPrices.length > 0) {
    doc.setFillColor(GOLD.r, GOLD.g, GOLD.b, 0.12 as unknown as number);
    doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b);
    const boxW = (PAGE_W - MARGIN * 2 - (filledPrices.length - 1) * 4) / filledPrices.length;
    filledPrices.forEach(([label, val], i) => {
      const bx = MARGIN + i * (boxW + 4);
      doc.roundedRect(bx, y, boxW, 18, 2, 2, "S");
      doc.setFontSize(7.5);
      doc.setTextColor(150, 140, 128);
      doc.text(label.toUpperCase(), bx + 4, y + 6);
      doc.setFontSize(12);
      doc.setTextColor(INK.r, INK.g, INK.b);
      doc.setFont("helvetica", "bold");
      doc.text(formatPrice(val), bx + 4, y + 14);
      doc.setFont("helvetica", "normal");
    });
    y += 26;
  }

  const rows = fieldRows(product);
  if (rows.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text("Product details", MARGIN, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    for (const [k, v] of rows) {
      doc.setFontSize(8.5);
      doc.setTextColor(150, 140, 128);
      doc.text(k.toUpperCase(), MARGIN, y);
      y += 4.5;
      doc.setFontSize(9.5);
      doc.setTextColor(INK.r, INK.g, INK.b);
      const lines = doc.splitTextToSize(v, PAGE_W - MARGIN * 2);
      doc.text(lines, MARGIN, y);
      y += lines.length * 5 + 4;
    }
  }

  finalizeFooters(doc);
  doc.save(`${product.itemCode || product.id}-product-sheet.pdf`);
}

/** Generates and downloads a full category catalogue PDF grouped by brand. */
export async function exportCategoryCataloguePdf(
  category: string,
  description: string,
  products: Product[],
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(doc, "Category Catalogue", category);
  let y = 34;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 80, 70);
  const descLines = doc.splitTextToSize(description, PAGE_W - MARGIN * 2);
  doc.text(descLines, MARGIN, y);
  y += descLines.length * 5 + 4;
  doc.setFontSize(9);
  doc.setTextColor(150, 140, 128);
  doc.text(`${products.length} products`, MARGIN, y);
  y += 10;

  const byBrand = new Map<string, Product[]>();
  for (const p of products) {
    if (!byBrand.has(p.brand)) byBrand.set(p.brand, []);
    byBrand.get(p.brand)!.push(p);
  }
  const brands = Array.from(byBrand.keys()).sort();

  const rowH = 22;
  const thumb = 16;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_H - 16) {
      doc.addPage();
      drawHeader(doc, "Category Catalogue", category);
      y = 34;
    }
  };

  for (const brand of brands) {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(INK.r, INK.g, INK.b);
    doc.text(brand, MARGIN, y);
    y += 3;
    doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 6;

    for (const p of byBrand.get(brand)!) {
      ensureSpace(rowH + 2);
      const rowTop = y;
      doc.setDrawColor(235, 230, 222);
      doc.setFillColor(250, 248, 244);
      doc.roundedRect(MARGIN, rowTop, thumb, thumb, 2, 2, "FD");

      const localUrl = getProductImage(p.id);
      if (localUrl) {
        const img = await toDataUrl(localUrl);
        if (img) {
          const pad = 1.5;
          const maxW = thumb - pad * 2;
          const maxH = thumb - pad * 2;
          const scale = Math.min(maxW / img.w, maxH / img.h);
          const w = img.w * scale;
          const h = img.h * scale;
          const format = img.dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
          doc.addImage(
            img.dataUrl,
            format,
            MARGIN + (thumb - w) / 2,
            rowTop + (thumb - h) / 2,
            w,
            h,
          );
        }
      }

      const tx = MARGIN + thumb + 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(INK.r, INK.g, INK.b);
      const nameLines = doc.splitTextToSize(p.displayName, PAGE_W - tx - MARGIN - 2);
      doc.text(nameLines[0], tx, rowTop + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140, 130, 120);
      doc.text(`SKU ${p.itemCode}  ·  ${p.subtitle}  ·  ${p.packaging || "—"}`, tx, rowTop + 11);

      const priceStr =
        p.casePrice != null
          ? `Case ${formatPrice(p.casePrice)}`
          : p.piecePrice != null
            ? `Piece ${formatPrice(p.piecePrice)}`
            : "";
      if (priceStr) {
        doc.setFontSize(8);
        doc.setTextColor(INK.r, INK.g, INK.b);
        doc.text(priceStr, tx, rowTop + 17);
      }

      y = rowTop + rowH;
    }
    y += 4;
  }

  finalizeFooters(doc);
  doc.save(`${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-catalogue.pdf`);
}
