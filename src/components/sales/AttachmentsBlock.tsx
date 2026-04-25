import { useRef, useState } from "react";
import { Paperclip, Link2, Trash2, FileText, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Attachment } from "@/store/salesStore";
import { useToast } from "@/hooks/use-toast";

interface Props {
  attachments: Attachment[];
  onAdd: (att: Omit<Attachment, "id" | "uploadedAt">) => void;
  onRemove: (id: string) => void;
  byId?: string;
}

/** Reusable attachments (link or file) component for lead/deal detail pages. */
export function AttachmentsBlock({ attachments, onAdd, onRemove, byId = "p1" }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    onAdd({ kind: "file", name: f.name, url: URL.createObjectURL(f), size: f.size, uploadedById: byId });
    toast({ title: "File attached", description: f.name });
    if (fileRef.current) fileRef.current.value = "";
  }
  function saveLink() {
    if (!linkUrl) return toast({ title: "URL required", variant: "destructive" });
    onAdd({ kind: "link", name: linkName || linkUrl, url: linkUrl, uploadedById: byId });
    setLinkOpen(false); setLinkUrl(""); setLinkName("");
    toast({ title: "Link attached" });
  }

  return (
    <div className="bg-surface border border-border rounded-sm">
      <div className="h-9 px-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" /> Attachments ({attachments.length})
        </h3>
        <div className="flex gap-1">
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
          <Button size="sm" variant="outline" className="h-6 text-2xs gap-1" onClick={() => fileRef.current?.click()}>
            <Plus className="w-3 h-3" /> File
          </Button>
          <Button size="sm" variant="outline" className="h-6 text-2xs gap-1" onClick={() => setLinkOpen(o => !o)}>
            <Link2 className="w-3 h-3" /> Link
          </Button>
        </div>
      </div>
      {linkOpen && (
        <div className="p-3 border-b border-border bg-surface-elevated/50 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <Input className="h-8 text-xs" placeholder="URL (https://…)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          <Input className="h-8 text-xs" placeholder="Display name (optional)" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
          <div className="flex gap-1">
            <Button size="sm" className="h-7 text-2xs" onClick={saveLink}>Add</Button>
            <Button size="sm" variant="outline" className="h-7 text-2xs" onClick={() => setLinkOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="p-2 space-y-1">
        {attachments.length === 0 && <p className="text-2xs text-muted-foreground text-center py-4">No attachments yet. Add a file or link.</p>}
        {attachments.map(a => (
          <div key={a.id} className="flex items-center gap-2 p-2 rounded-sm hover:bg-surface-hover text-xs">
            {a.kind === "file" ? <FileText className="w-3.5 h-3.5 text-mod-sales shrink-0" /> : <Link2 className="w-3.5 h-3.5 text-primary shrink-0" />}
            <a href={a.url} target="_blank" rel="noreferrer" className="flex-1 truncate hover:text-primary">{a.name}</a>
            {a.size && <span className="text-3xs text-muted-foreground font-mono">{(a.size / 1024).toFixed(1)} KB</span>}
            <span className="text-3xs text-muted-foreground font-mono">{a.uploadedAt.slice(0, 10)}</span>
            <a href={a.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="w-3 h-3" /></a>
            <button onClick={() => onRemove(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface NotesProps {
  notes: { id: string; text: string; byId: string; createdAt: string }[];
  onAdd: (text: string) => void;
}

export function NotesBlock({ notes, onAdd }: NotesProps) {
  const [text, setText] = useState("");
  const { toast } = useToast();
  return (
    <div className="bg-surface border border-border rounded-sm">
      <div className="h-9 px-3 border-b border-border flex items-center">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Notes ({notes.length})</h3>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex gap-2">
          <Input className="h-8 text-xs flex-1" placeholder="Add a quick note…" value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onAdd(text.trim()); setText(""); toast({ title: "Note added" }); } }} />
          <Button size="sm" className="h-8 text-xs" onClick={() => { if (text.trim()) { onAdd(text.trim()); setText(""); toast({ title: "Note added" }); } }}>Add</Button>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-auto">
          {notes.length === 0 && <p className="text-2xs text-muted-foreground text-center py-3">No notes yet.</p>}
          {[...notes].reverse().map(n => (
            <div key={n.id} className="p-2 bg-background border border-border rounded-sm text-xs">
              <div className="flex items-center justify-between text-3xs text-muted-foreground mb-1 font-mono">
                <span>{n.byId}</span><span>{n.createdAt.slice(0, 16).replace("T", " ")}</span>
              </div>
              <div>{n.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
