import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { useSalesStore, ALL_DEAL_STAGES, dealStageVariant } from "@/store/salesStore";
import { PEOPLE, inr } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { AttachmentsBlock, NotesBlock } from "@/components/sales/AttachmentsBlock";

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const deal = useSalesStore(s => s.deals.find(d => d.id === id));
  const setStage = useSalesStore(s => s.setDealStage);
  const company = useSalesStore(s => s.companies.find(c => c.id === deal?.companyId));
  const contact = useSalesStore(s => s.contacts.find(c => c.id === deal?.contactId));
  const lead = useSalesStore(s => s.leads.find(l => l.id === deal?.leadId));
  const addDealNote = useSalesStore(s => s.addDealNote);
  const addDealAttachment = useSalesStore(s => s.addDealAttachment);
  const removeDealAttachment = useSalesStore(s => s.removeDealAttachment);

  if (!deal) return <div className="p-6 text-sm">Deal not found. <Link to="/sales/deals" className="text-primary">Back</Link></div>;
  const owner = PEOPLE.find(p => p.id === deal.ownerId);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader title={deal.title} subtitle={company?.name} accentVar="--mod-sales"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Sparkles className="w-3.5 h-3.5" /> AI Insights</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><FileText className="w-3.5 h-3.5" /> Create Proposal</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/sales/deals")}><ArrowLeft className="w-3.5 h-3.5" /> Back</Button>
          </>
        } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 flex-1">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stage Progression</h3>
            <div className="flex gap-1">
              {ALL_DEAL_STAGES.map(s => {
                const idx = ALL_DEAL_STAGES.indexOf(deal.stage);
                const cur = ALL_DEAL_STAGES.indexOf(s);
                const active = cur <= idx && deal.stage !== "Closed Lost";
                const lost = deal.stage === "Closed Lost" && s === "Closed Lost";
                return (
                  <button
                    key={s}
                    onClick={() => { setStage(deal.id, s); toast({ title: `Moved to ${s}` }); }}
                    className={`flex-1 h-8 text-2xs font-medium rounded-sm transition-colors ${active ? "bg-primary/15 text-primary border border-primary/30" : lost ? "bg-destructive/15 text-destructive border border-destructive/30" : "bg-surface-hover text-muted-foreground hover:text-foreground border border-border"}`}
                  >{s}</button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deal Info</h3>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div><span className="text-muted-foreground">Stage:</span> <StatusPill variant={dealStageVariant(deal.stage)}>{deal.stage}</StatusPill></div>
              <div><span className="text-muted-foreground">Source:</span> {deal.source}</div>
              <div><span className="text-muted-foreground">Value:</span> <span className="font-mono font-semibold">{inr(deal.value)}</span></div>
              <div><span className="text-muted-foreground">Probability:</span> {deal.probability}%</div>
              <div><span className="text-muted-foreground">Weighted:</span> <span className="font-mono">{inr(deal.value * deal.probability / 100)}</span></div>
              <div><span className="text-muted-foreground">Expected Close:</span> <span className="font-mono">{deal.expectedCloseDate}</span></div>
              <div><span className="text-muted-foreground">Created:</span> {deal.createdAt}</div>
              <div><span className="text-muted-foreground">Last Activity:</span> {deal.lastActivityAt}</div>
            </div>
          </div>

          {lead && (
            <div className="bg-surface border border-border rounded-sm p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Source Lead</h3>
              <Link to={`/sales/leads/${lead.id}`} className="block hover:text-primary text-xs">
                <div className="font-medium">{lead.title}</div>
                <div className="text-2xs text-muted-foreground">{lead.firstName} {lead.lastName} · {lead.sourcePlatform}</div>
              </Link>
            </div>
          )}
          <NotesBlock notes={deal.noteList ?? []} onAdd={(t) => addDealNote(deal.id, t)} />
          <AttachmentsBlock
            attachments={deal.attachments ?? []}
            onAdd={(att) => addDealAttachment(deal.id, att)}
            onRemove={(attId) => removeDealAttachment(deal.id, attId)}
          />
        </div>

        <div className="space-y-3">
          <div className="bg-surface border border-border rounded-sm p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Owner</h3>
            {owner && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-primary/15 text-primary flex items-center justify-center font-mono text-xs font-bold">{owner.initials}</div>
                <div><div className="text-xs font-medium">{owner.name}</div><div className="text-2xs text-muted-foreground">{owner.dept}</div></div>
              </div>
            )}
          </div>
          {company && (
            <div className="bg-surface border border-border rounded-sm p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Company</h3>
              <Link to={`/sales/companies/${company.id}`} className="text-xs font-medium hover:text-primary">{company.name}</Link>
              <div className="text-2xs text-muted-foreground mt-0.5">{company.industry} · {company.size}</div>
            </div>
          )}
          {contact && (
            <div className="bg-surface border border-border rounded-sm p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Primary Contact</h3>
              <div className="text-xs font-medium">{contact.firstName} {contact.lastName}</div>
              <div className="text-2xs text-muted-foreground">{contact.designation}</div>
              <div className="text-2xs text-primary mt-1">{contact.email}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
