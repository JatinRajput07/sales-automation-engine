import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Send, Eye } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore, ALL_PROPOSAL_STATUSES, proposalStatusVariant } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const proposal = useSalesStore(s => s.proposals.find(p => p.id === id));
  const setStatus = useSalesStore(s => s.setProposalStatus);
  const company = useSalesStore(s => s.companies.find(c => c.id === proposal?.companyId));

  if (!proposal) return <div className="p-6 text-sm">Proposal not found. <Link to="/sales/proposals" className="text-primary">Back</Link></div>;
  const by = PEOPLE.find(p => p.id === proposal.preparedById);
  const subtotal = proposal.lineItems.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = Math.round((subtotal - proposal.discount) * (proposal.taxPercent / 100));
  const total = subtotal - proposal.discount + tax;

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title={proposal.title} subtitle={`${proposal.number} · ${company?.name ?? ""}`} accentVar="--mod-sales"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => toast({ title: "PDF download mocked" })}><Download className="w-3.5 h-3.5" /> PDF</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { setStatus(proposal.id, "Sent"); toast({ title: "Proposal sent to client" }); }}><Send className="w-3.5 h-3.5" /> Send</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/sales/proposals")}><ArrowLeft className="w-3.5 h-3.5" /> Back</Button>
          </>
        } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 flex-1">
        <div className="lg:col-span-2 space-y-3">
          <Section title="Executive Summary">{proposal.executiveSummary}</Section>
          <Section title="Our Approach">{proposal.approach}</Section>
          <Section title="Scope of Work"><pre className="whitespace-pre-wrap font-sans">{proposal.scopeOfWork}</pre></Section>
          <Section title="Timeline"><pre className="whitespace-pre-wrap font-sans">{proposal.timeline}</pre></Section>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-2xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">Pricing</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                  <th className="text-left h-7 font-medium">Item</th>
                  <th className="text-left h-7 font-medium">Description</th>
                  <th className="text-center h-7 font-medium">Qty</th>
                  <th className="text-right h-7 font-medium">Rate</th>
                  <th className="text-right h-7 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {proposal.lineItems.map(it => (
                  <tr key={it.id} className="border-t border-border">
                    <td className="py-2 font-medium">{it.item}</td>
                    <td className="py-2 text-muted-foreground">{it.description}</td>
                    <td className="py-2 text-center">{it.qty} {it.unit}</td>
                    <td className="py-2 text-right font-mono">{inr(it.rate)}</td>
                    <td className="py-2 text-right font-mono">{inr(it.qty * it.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs max-w-xs ml-auto">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{inr(subtotal)}</span></div>
              {proposal.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="font-mono">-{inr(proposal.discount)}</span></div>}
              {proposal.taxPercent > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax ({proposal.taxPercent}%)</span><span className="font-mono">{inr(tax)}</span></div>}
              <div className="flex justify-between pt-1 border-t border-border text-sm"><span className="font-semibold">Total</span><span className="font-mono font-bold">{inr(total)}</span></div>
            </div>
          </div>

          <Section title="Terms & Conditions">{proposal.terms}</Section>
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-2xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">Status</h3>
            <div className="mb-3"><StatusPill variant={proposalStatusVariant(proposal.status)}>{proposal.status}</StatusPill></div>
            <div className="space-y-1.5">
              {ALL_PROPOSAL_STATUSES.map(s => (
                <button key={s} onClick={() => { setStatus(proposal.id, s); toast({ title: `Status: ${s}` }); }}
                  className={`w-full text-left px-2 h-7 rounded-sm text-xs ${proposal.status === s ? "bg-primary/15 text-primary" : "hover:bg-surface-hover text-muted-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3 text-xs space-y-2">
            <h3 className="text-2xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">Details</h3>
            <div><span className="text-muted-foreground">Number:</span> <span className="font-mono">{proposal.number}</span></div>
            <div><span className="text-muted-foreground">Prepared by:</span> {by?.name}</div>
            <div><span className="text-muted-foreground">Date:</span> {proposal.proposalDate}</div>
            <div><span className="text-muted-foreground">Valid until:</span> {proposal.validUntil}</div>
            {proposal.sentDate && <div><span className="text-muted-foreground">Sent:</span> {proposal.sentDate}</div>}
            {proposal.viewedDate && <div className="flex items-center gap-1"><Eye className="w-3 h-3 text-success" /><span className="text-muted-foreground">Viewed:</span> {proposal.viewedDate}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-sm p-3">
      <h3 className="text-2xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">{title}</h3>
      <div className="text-xs leading-relaxed">{children}</div>
    </div>
  );
}
