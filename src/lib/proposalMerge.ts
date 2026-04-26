import { PDFDocument } from "pdf-lib";
import { buildProposalPDFBytes, type ProposalExportData } from "./proposalExport";
import type { ProposalSettings } from "@/store/salesStore";

export interface MergeOptions {
  templateBytes?: Uint8Array | ArrayBuffer | null;
  prePages: number[];   // 1-based page indices to include BEFORE proposal
  postPages: number[];  // 1-based page indices to include AFTER proposal
  data: ProposalExportData;
  settings: ProposalSettings;
}

/**
 * Build a merged PDF: [selected template pre-pages] + [AI proposal] + [selected template post-pages]
 * Returns raw bytes of the final PDF.
 */
export async function buildMergedProposalPDF(opts: MergeOptions): Promise<Uint8Array> {
  const { templateBytes, prePages, postPages, data, settings } = opts;

  const proposalBytes = await buildProposalPDFBytes(data, settings);
  const proposalDoc = await PDFDocument.load(proposalBytes);

  const merged = await PDFDocument.create();

  let templateDoc: PDFDocument | null = null;
  let totalTemplatePages = 0;
  if (templateBytes) {
    templateDoc = await PDFDocument.load(templateBytes);
    totalTemplatePages = templateDoc.getPageCount();
  }

  const sanitize = (arr: number[]) =>
    Array.from(new Set(arr))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= totalTemplatePages)
      .sort((a, b) => a - b);

  // 1. Pre-pages from template
  if (templateDoc && prePages.length) {
    const idx = sanitize(prePages).map((n) => n - 1);
    const pages = await merged.copyPages(templateDoc, idx);
    pages.forEach((p) => merged.addPage(p));
  }

  // 2. Proposal pages
  const proposalPages = await merged.copyPages(proposalDoc, proposalDoc.getPageIndices());
  proposalPages.forEach((p) => merged.addPage(p));

  // 3. Post-pages from template
  if (templateDoc && postPages.length) {
    const idx = sanitize(postPages).map((n) => n - 1);
    const pages = await merged.copyPages(templateDoc, idx);
    pages.forEach((p) => merged.addPage(p));
  }

  return await merged.save();
}

/** Quickly read page count of an uploaded PDF */
export async function getPdfPageCount(bytes: Uint8Array | ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

/** Parse a page-range string like "1-4, 7, 10-12" into a sorted unique 1-based list */
export function parsePageRange(input: string, max: number): number[] {
  const out = new Set<number>();
  for (const raw of input.split(",")) {
    const seg = raw.trim();
    if (!seg) continue;
    const m = seg.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Math.max(1, parseInt(m[1], 10));
      const b = Math.min(max, parseInt(m[2], 10));
      for (let i = a; i <= b; i++) out.add(i);
    } else if (/^\d+$/.test(seg)) {
      const n = parseInt(seg, 10);
      if (n >= 1 && n <= max) out.add(n);
    }
  }
  return [...out].sort((a, b) => a - b);
}

export function downloadBytes(bytes: Uint8Array, filename: string, mime = "application/pdf") {
  // Copy into a fresh ArrayBuffer to satisfy strict BlobPart typing
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const blob = new Blob([ab], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function bytesToBlobUrl(bytes: Uint8Array, mime = "application/pdf"): string {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const blob = new Blob([ab], { type: mime });
  return URL.createObjectURL(blob);
}
