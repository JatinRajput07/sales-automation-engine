import jsPDF from "jspdf";
import type { ProposalSettings } from "@/store/salesStore";

export interface ProposalExportData {
  title: string;
  number?: string;
  clientName: string;
  preparedBy: string;
  proposalDate: string;
  validUntil: string;
  sections: Array<{ title: string; body: string }>;
  lineItems: Array<{ item: string; description: string; qty: number; unit: string; rate: number }>;
  subtotal: number;
  discount: number;
  taxPercent: number;
  tax: number;
  total: number;
  currency: string;
  terms?: string;
}

const fmtMoney = (n: number, c: string) => {
  const s = new Intl.NumberFormat(c === "INR" ? "en-IN" : "en-US", { maximumFractionDigits: 0 }).format(n);
  return c === "INR" ? `₹${s}` : `$${s}`;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m) return [15, 23, 42];
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)];
};

export async function exportProposalPDF(data: ProposalExportData, settings: ProposalSettings) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentW = pageW - margin * 2;
  const [pr, pg, pb] = hexToRgb(settings.primaryColor);
  const [ar, ag, ab] = hexToRgb(settings.accentColor);

  let y = margin;

  const ensureSpace = (need: number) => {
    if (y + need > pageH - margin - 30) {
      addFooter();
      doc.addPage();
      y = margin;
      addHeader();
    }
  };

  const addHeader = () => {
    if (settings.brandLogo) {
      try {
        doc.addImage(settings.brandLogo, "PNG", margin, margin - 10, 50, 50);
      } catch { /* ignore */ }
    }
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(pr, pg, pb);
    doc.text(settings.brandName, pageW - margin, margin, { align: "right" });
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120, 120, 120);
    doc.text(settings.brandTagline, pageW - margin, margin + 12, { align: "right" });
    doc.setDrawColor(ar, ag, ab).setLineWidth(2);
    doc.line(margin, margin + 50, pageW - margin, margin + 50);
    y = margin + 70;
  };

  const addFooter = () => {
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(140, 140, 140);
    doc.text(settings.footerText, margin, pageH - 25);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 25, { align: "right" });
    doc.setDrawColor(220, 220, 220).setLineWidth(0.5);
    doc.line(margin, pageH - 35, pageW - margin, pageH - 35);
  };

  addHeader();

  // Title block
  doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(pr, pg, pb);
  const titleLines = doc.splitTextToSize(data.title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 28 + 4;

  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(100, 100, 100);
  doc.text(`Prepared for ${data.clientName}  ·  By ${data.preparedBy}`, margin, y);
  y += 14;
  doc.setFontSize(9);
  doc.text(`Date: ${data.proposalDate}    Valid until: ${data.validUntil}${data.number ? `    Ref: ${data.number}` : ""}`, margin, y);
  y += 24;

  // Sections
  for (const sec of data.sections) {
    if (!sec.body?.trim()) continue;
    ensureSpace(60);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(ar, ag, ab);
    doc.text(sec.title.toUpperCase(), margin, y);
    y += 6;
    doc.setDrawColor(ar, ag, ab).setLineWidth(1);
    doc.line(margin, y, margin + 40, y);
    y += 14;
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(40, 40, 40);
    const paragraphs = sec.body.split(/\n+/);
    for (const para of paragraphs) {
      if (!para.trim()) continue;
      const isBullet = /^\s*[-•\d+\.]/.test(para);
      const lines = doc.splitTextToSize(para.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, ""), contentW - (isBullet ? 14 : 0));
      ensureSpace(lines.length * 13 + 4);
      if (isBullet) {
        doc.setFillColor(ar, ag, ab);
        doc.circle(margin + 4, y - 3, 1.5, "F");
        doc.text(lines, margin + 14, y);
      } else {
        doc.text(lines, margin, y);
      }
      y += lines.length * 13 + 4;
    }
    y += 12;
  }

  // Pricing table
  if (data.lineItems.length) {
    ensureSpace(80);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(ar, ag, ab);
    doc.text("INVESTMENT", margin, y);
    y += 6;
    doc.setDrawColor(ar, ag, ab).setLineWidth(1);
    doc.line(margin, y, margin + 40, y);
    y += 16;

    // Header row
    doc.setFillColor(pr, pg, pb);
    doc.rect(margin, y, contentW, 22, "F");
    doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(255, 255, 255);
    doc.text("ITEM", margin + 8, y + 14);
    doc.text("QTY", margin + contentW - 180, y + 14);
    doc.text("RATE", margin + contentW - 130, y + 14);
    doc.text("AMOUNT", margin + contentW - 8, y + 14, { align: "right" });
    y += 28;

    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(40, 40, 40);
    for (const it of data.lineItems) {
      ensureSpace(40);
      const itemLines = doc.splitTextToSize(it.item, contentW - 230);
      const descLines = it.description ? doc.splitTextToSize(it.description, contentW - 230) : [];
      doc.setFont("helvetica", "bold");
      doc.text(itemLines, margin + 8, y);
      let rowH = itemLines.length * 12;
      if (descLines.length) {
        doc.setFont("helvetica", "normal").setTextColor(120, 120, 120).setFontSize(8);
        doc.text(descLines, margin + 8, y + rowH + 2);
        rowH += descLines.length * 10 + 2;
        doc.setFontSize(9).setTextColor(40, 40, 40);
      }
      doc.setFont("helvetica", "normal");
      doc.text(`${it.qty} ${it.unit}`, margin + contentW - 180, y);
      doc.text(fmtMoney(it.rate, data.currency), margin + contentW - 130, y);
      doc.setFont("helvetica", "bold");
      doc.text(fmtMoney(it.qty * it.rate, data.currency), margin + contentW - 8, y, { align: "right" });
      y += Math.max(rowH, 14) + 6;
      doc.setDrawColor(230, 230, 230).setLineWidth(0.5);
      doc.line(margin, y - 2, margin + contentW, y - 2);
    }

    // Totals
    y += 10;
    ensureSpace(80);
    const tx = margin + contentW - 200;
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100, 100, 100);
    const totalRow = (label: string, val: string, bold = false) => {
      if (bold) doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(pr, pg, pb);
      else doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100, 100, 100);
      doc.text(label, tx, y);
      doc.text(val, margin + contentW - 8, y, { align: "right" });
      y += bold ? 18 : 14;
    };
    totalRow("Subtotal", fmtMoney(data.subtotal, data.currency));
    if (data.discount > 0) totalRow("Discount", `- ${fmtMoney(data.discount, data.currency)}`);
    if (data.taxPercent > 0) totalRow(`Tax (${data.taxPercent}%)`, fmtMoney(data.tax, data.currency));
    doc.setDrawColor(pr, pg, pb).setLineWidth(1);
    doc.line(tx, y - 4, margin + contentW, y - 4);
    y += 4;
    totalRow("TOTAL", fmtMoney(data.total, data.currency), true);
  }

  // Terms
  if (data.terms?.trim()) {
    y += 10;
    ensureSpace(60);
    doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(ar, ag, ab);
    doc.text("TERMS & CONDITIONS", margin, y);
    y += 6;
    doc.setDrawColor(ar, ag, ab).setLineWidth(1);
    doc.line(margin, y, margin + 40, y);
    y += 14;
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(60, 60, 60);
    const termLines = doc.splitTextToSize(data.terms, contentW);
    ensureSpace(termLines.length * 12);
    doc.text(termLines, margin, y);
    y += termLines.length * 12;
  }

  // Final footer on every page
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    addFooter();
  }

  doc.save(`${data.title.replace(/[^a-z0-9]+/gi, "_")}.pdf`);
}

// Minimal DOCX generation (Office Open XML, single-file approach using browser-native blob)
// Uses a docx-flavored HTML wrapper. Word can open .doc HTML files reliably.
export function exportProposalDOCX(data: ProposalExportData, settings: ProposalSettings) {
  const css = `
    body { font-family: ${settings.fontFamily}, Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
    h1 { color: ${settings.primaryColor}; font-size: 28pt; margin: 0 0 8pt; }
    h2 { color: ${settings.accentColor}; font-size: 14pt; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid ${settings.accentColor}; padding-bottom: 4pt; margin-top: 24pt; }
    .meta { color: #666; font-size: 10pt; margin-bottom: 24pt; }
    .header { border-bottom: 3px solid ${settings.accentColor}; padding-bottom: 12pt; margin-bottom: 24pt; display: flex; justify-content: space-between; align-items: center; }
    .brand { text-align: right; }
    .brand-name { color: ${settings.primaryColor}; font-weight: bold; font-size: 12pt; }
    .brand-tag { color: #888; font-size: 9pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 8pt; }
    th { background: ${settings.primaryColor}; color: white; padding: 8pt; text-align: left; font-size: 9pt; }
    td { padding: 8pt; border-bottom: 1px solid #e5e5e5; font-size: 10pt; vertical-align: top; }
    .totals { margin-top: 12pt; margin-left: auto; width: 280pt; }
    .totals td { border: none; padding: 4pt 0; }
    .totals .total-row td { border-top: 2px solid ${settings.primaryColor}; font-weight: bold; font-size: 12pt; color: ${settings.primaryColor}; padding-top: 8pt; }
    .footer { margin-top: 48pt; padding-top: 12pt; border-top: 1px solid #ccc; color: #888; font-size: 8pt; text-align: center; }
    p { margin: 0 0 8pt; }
    ul { margin: 0 0 8pt 16pt; padding: 0; }
    li { margin-bottom: 4pt; }
  `;

  const renderBody = (body: string) => {
    const lines = body.split(/\n+/).filter(Boolean);
    const isBullets = lines.every(l => /^\s*[-•\d+\.]/.test(l));
    if (isBullets && lines.length > 1) {
      return `<ul>${lines.map(l => `<li>${escapeHtml(l.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, ""))}</li>`).join("")}</ul>`;
    }
    return lines.map(l => `<p>${escapeHtml(l)}</p>`).join("");
  };

  const sectionsHtml = data.sections
    .filter(s => s.body?.trim())
    .map(s => `<h2>${s.title}</h2>${renderBody(s.body)}`)
    .join("");

  const itemsHtml = data.lineItems.map(it => `
    <tr>
      <td><strong>${escapeHtml(it.item)}</strong>${it.description ? `<br><span style="color:#888;font-size:9pt">${escapeHtml(it.description)}</span>` : ""}</td>
      <td>${it.qty} ${escapeHtml(it.unit)}</td>
      <td>${fmtMoney(it.rate, data.currency)}</td>
      <td style="text-align:right"><strong>${fmtMoney(it.qty * it.rate, data.currency)}</strong></td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${escapeHtml(data.title)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>${css}</style></head>
<body>
  <div class="header">
    <div>${settings.brandLogo ? `<img src="${settings.brandLogo}" style="max-height:50pt"/>` : ""}</div>
    <div class="brand"><div class="brand-name">${escapeHtml(settings.brandName)}</div><div class="brand-tag">${escapeHtml(settings.brandTagline)}</div></div>
  </div>
  <h1>${escapeHtml(data.title)}</h1>
  <div class="meta">
    Prepared for <strong>${escapeHtml(data.clientName)}</strong> · By ${escapeHtml(data.preparedBy)}<br>
    Date: ${data.proposalDate} · Valid until: ${data.validUntil}${data.number ? ` · Ref: ${data.number}` : ""}
  </div>
  ${sectionsHtml}
  ${data.lineItems.length ? `
  <h2>Investment</h2>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <table class="totals">
    <tr><td>Subtotal</td><td style="text-align:right">${fmtMoney(data.subtotal, data.currency)}</td></tr>
    ${data.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">- ${fmtMoney(data.discount, data.currency)}</td></tr>` : ""}
    ${data.taxPercent > 0 ? `<tr><td>Tax (${data.taxPercent}%)</td><td style="text-align:right">${fmtMoney(data.tax, data.currency)}</td></tr>` : ""}
    <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${fmtMoney(data.total, data.currency)}</td></tr>
  </table>
  ` : ""}
  ${data.terms ? `<h2>Terms & Conditions</h2><p>${escapeHtml(data.terms)}</p>` : ""}
  <div class="footer">${escapeHtml(settings.footerText)}</div>
</body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  triggerDownload(blob, `${data.title.replace(/[^a-z0-9]+/gi, "_")}.doc`);
}

export function exportProposalTXT(data: ProposalExportData, settings: ProposalSettings) {
  const line = "═".repeat(70);
  const sub = "─".repeat(70);
  let out = "";
  out += `${line}\n${settings.brandName.toUpperCase()}  —  ${settings.brandTagline}\n${line}\n\n`;
  out += `${data.title.toUpperCase()}\n${sub}\n`;
  out += `Prepared for: ${data.clientName}\n`;
  out += `Prepared by:  ${data.preparedBy}\n`;
  out += `Date:         ${data.proposalDate}\n`;
  out += `Valid until:  ${data.validUntil}\n`;
  if (data.number) out += `Reference:    ${data.number}\n`;
  out += "\n";
  for (const sec of data.sections) {
    if (!sec.body?.trim()) continue;
    out += `\n${sec.title.toUpperCase()}\n${sub}\n${sec.body}\n`;
  }
  if (data.lineItems.length) {
    out += `\nINVESTMENT\n${sub}\n`;
    for (const it of data.lineItems) {
      out += `  • ${it.item} (${it.qty} ${it.unit} × ${fmtMoney(it.rate, data.currency)}) = ${fmtMoney(it.qty * it.rate, data.currency)}\n`;
      if (it.description) out += `      ${it.description}\n`;
    }
    out += `\n  Subtotal: ${fmtMoney(data.subtotal, data.currency)}\n`;
    if (data.discount > 0) out += `  Discount: -${fmtMoney(data.discount, data.currency)}\n`;
    if (data.taxPercent > 0) out += `  Tax (${data.taxPercent}%): ${fmtMoney(data.tax, data.currency)}\n`;
    out += `  TOTAL:    ${fmtMoney(data.total, data.currency)}\n`;
  }
  if (data.terms) out += `\nTERMS & CONDITIONS\n${sub}\n${data.terms}\n`;
  out += `\n${line}\n${settings.footerText}\n${line}\n`;

  const blob = new Blob([out], { type: "text/plain;charset=utf-8" });
  triggerDownload(blob, `${data.title.replace(/[^a-z0-9]+/gi, "_")}.txt`);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// AI generator: produces tone-aware sections from a brief.
export function generateAIProposal(opts: {
  clientName: string;
  industry?: string;
  projectType?: string;
  brief?: string;
  tone: "Persuasive" | "Professional" | "Consultative" | "Bold";
  brandName: string;
}): { title: string; sections: Record<string, string>; suggestedItems: Array<{ item: string; description: string; qty: number; unit: string; rate: number }> } {
  const { clientName, industry = "your industry", projectType = "digital solution", brief = "", tone, brandName } = opts;
  const toneOpener: Record<string, string> = {
    Persuasive: `${clientName} stands at a defining inflection point. The opportunity in front of you is not incremental — it is transformational, and timing matters.`,
    Professional: `${brandName} is pleased to submit this proposal to ${clientName} for the design, build and delivery of a high-impact ${projectType.toLowerCase()}.`,
    Consultative: `Following our conversations with the ${clientName} team, we have shaped this proposal around the specific outcomes you said matter most.`,
    Bold: `${clientName} doesn't need another vendor. You need a partner ready to ship outcomes — fast, measurable, undeniable. That is exactly what this proposal delivers.`,
  };

  return {
    title: `${projectType} Proposal for ${clientName}`,
    sections: {
      executiveSummary: `${toneOpener[tone]}\n\nThis engagement is purpose-built to move ${clientName} from intent to outcome — combining strategic clarity, design excellence and senior engineering execution. Across a focused delivery window, we will ship a production-grade ${projectType.toLowerCase()} that compounds value long after launch.\n\nWhat you can expect:\n- A senior, accountable team aligned to your goals\n- Weekly demos and transparent progress signals\n- Measurable KPIs tied to revenue and retention\n- A handover that leaves your team stronger, not dependent`,
      problemStatement: `Teams in ${industry} consistently lose value at three predictable points: unclear customer intent, fragmented systems, and execution that stalls at the last 20%.\n\n${brief ? `Specifically, ${clientName} has shared the following context:\n"${brief}"\n\n` : ""}The cost of leaving this unaddressed compounds quickly: slower decisions, higher acquisition cost, and a product experience that fails to differentiate. This proposal addresses the root causes — not the symptoms.`,
      ourSolution: `Our solution is structured in three reinforcing layers:\n\n1. STRATEGY — A discovery sprint to align stakeholders, validate assumptions and lock the success metrics.\n2. DESIGN — Conversion-focused UX, a coherent design system, and pixel-perfect interfaces tested with real users.\n3. ENGINEERING — A modern, scalable stack delivered through two-week sprints with continuous QA and CI/CD.\n\nEvery deliverable is owned by a named senior on our team. Nothing is left to chance, nothing is outsourced.`,
      timeline: `Week 1 — Discovery, stakeholder interviews, success metrics\nWeeks 2-3 — UX architecture, wireframes, design system foundation\nWeeks 4-5 — High-fidelity design, prototype, usability validation\nWeeks 6-10 — Engineering sprints with weekly demos\nWeek 11 — QA hardening, performance, accessibility, security review\nWeek 12 — Launch, handover, 30-day hypercare`,
    },
    suggestedItems: [
      { item: "Discovery & Strategy", description: "Stakeholder workshops, success metrics, technical architecture", qty: 1, unit: "Phase", rate: 120000 },
      { item: "UX/UI Design", description: "Design system, full screen flows, interactive prototype", qty: 1, unit: "Phase", rate: 240000 },
      { item: "Engineering & Delivery", description: "Frontend, backend, integrations, automated testing", qty: 1, unit: "Phase", rate: 580000 },
      { item: "Launch & Hypercare", description: "Production deployment, monitoring, 30-day support", qty: 1, unit: "Phase", rate: 90000 },
    ],
  };
}
