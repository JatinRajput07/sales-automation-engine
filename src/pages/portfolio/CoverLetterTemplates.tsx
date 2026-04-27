import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePortfolioStore } from "@/store/portfolioStore";
import { useToast } from "@/hooks/use-toast";

export default function CoverLetterTemplates() {
  const templates = usePortfolioStore((s) => s.templates);
  const add = usePortfolioStore((s) => s.addTemplate);
  const update = usePortfolioStore((s) => s.updateTemplate);
  const remove = usePortfolioStore((s) => s.removeTemplate);
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-full">
      <ModuleHeader
        title="Cover Letter Templates"
        subtitle={`${templates.length} templates · use {{tokens}} for personalisation`}
        accentVar="--mod-portfolio"
        actions={
          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => {
            const id = add({ name: "New Template", description: "Describe this template", tone: "Formal", body: "Dear {{recipient_name}},\n\n[Your message here]\n\nBest,\n{{sender_name}}" });
            setEditingId(id);
          }}><Plus className="w-3 h-3" /> New Template</Button>
        }
      />
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((t) => {
          const isEditing = editingId === t.id;
          return (
            <div key={t.id} className="bg-surface border border-border rounded-sm p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Input className="h-8 text-sm font-semibold" defaultValue={t.name} onBlur={(e) => update(t.id, { name: e.target.value })} />
                <select className="h-8 px-2 rounded-sm bg-background border border-border text-xs" defaultValue={t.tone} onChange={(e) => update(t.id, { tone: e.target.value as typeof t.tone })}>
                  <option>Formal</option><option>Friendly</option><option>Bold</option><option>Consultative</option>
                </select>
              </div>
              <Label className="text-2xs">Description</Label>
              <Input className="h-8 text-xs mb-2" defaultValue={t.description} onBlur={(e) => update(t.id, { description: e.target.value })} />
              <Label className="text-2xs">Body (tokens: {"{{recipient_name}}, {{project_title}}, {{related_project}}, {{problem}}, {{sender_name}}"})</Label>
              <Textarea
                className="text-xs font-serif leading-relaxed min-h-[200px]"
                defaultValue={t.body}
                onBlur={(e) => { update(t.id, { body: e.target.value }); if (isEditing) toast({ title: "Template saved" }); }}
              />
              <div className="flex justify-end gap-1 mt-2">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setEditingId(t.id); toast({ title: "Editing — changes save on blur" }); }}><Save className="w-3 h-3" /> Edit</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs text-destructive gap-1" onClick={() => { if (confirm(`Delete "${t.name}"?`)) remove(t.id); }}><Trash2 className="w-3 h-3" /> Delete</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
