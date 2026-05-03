import { useState } from "react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { useSuperAdminStore } from "@/store/superAdminStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Modules() {
  const { moduleConfigs, tenants, updateModuleConfig } = useSuperAdminStore();
  const [editing, setEditing] = useState<string | null>(null);
  const cfg = moduleConfigs.find(m => m.id === editing);

  return (
    <div className="pb-8">
      <SAPageHeader title="Product Modules" subtitle={`${moduleConfigs.length} modules configured`} />
      <div className="px-6 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moduleConfigs.map(m => {
          const usage = tenants.filter(t => t.modules.includes(m.id)).length;
          const pct = Math.round(usage / tenants.length * 100);
          return (
            <div key={m.id} className="bg-white border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h3 className="font-semibold text-sm">{m.name}</h3>
                </div>
                <span className={`text-2xs px-1.5 rounded ${m.status === "active" ? "bg-green-100 text-green-700" : m.status === "maintenance" ? "bg-amber-100 text-amber-800" : "bg-gray-100"}`}>{m.status}</span>
              </div>
              <div className="mt-3 text-xs space-y-1">
                <Row label="Tenants" v={`${usage} (${pct}%)`} />
                <Row label="Default Price" v={`₹${m.monthlyPrice}/mo`} />
                <Row label="Schema" v={<span className="font-mono text-2xs">{m.schemaName}</span>} />
                <Row label="Health" v={<span className="text-green-600">✅ Operational</span>} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(m.id)}>Edit</Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { updateModuleConfig(m.id, { status: m.status === "maintenance" ? "active" : "maintenance" }); toast.success("Status toggled"); }}>
                  {m.status === "maintenance" ? "Resume" : "Maintenance"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {cfg && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setEditing(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-md bg-white border-l border-border h-full p-5 overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold">{cfg.name} — Edit Config</h3>
            <div className="mt-4 space-y-3">
              <Field label="Description"><Textarea value={cfg.description} onChange={e => updateModuleConfig(cfg.id, { description: e.target.value })} /></Field>
              <Field label="Monthly Price"><Input type="number" value={cfg.monthlyPrice} onChange={e => updateModuleConfig(cfg.id, { monthlyPrice: +e.target.value })} /></Field>
              <Field label="Annual Price"><Input type="number" value={cfg.annualPrice} onChange={e => updateModuleConfig(cfg.id, { annualPrice: +e.target.value })} /></Field>
              <Field label="Status">
                <select value={cfg.status} onChange={e => updateModuleConfig(cfg.id, { status: e.target.value as any })} className="h-9 w-full px-2 text-sm border border-border rounded-md">
                  <option value="active">Active</option><option value="beta">Beta</option><option value="maintenance">Maintenance</option><option value="deprecated">Deprecated</option>
                </select>
              </Field>
              {cfg.status === "maintenance" && <Field label="Maintenance Message"><Textarea value={cfg.maintenanceMsg || ""} onChange={e => updateModuleConfig(cfg.id, { maintenanceMsg: e.target.value })} /></Field>}
              <Field label="Changelog"><Textarea value={cfg.changelog} onChange={e => updateModuleConfig(cfg.id, { changelog: e.target.value })} /></Field>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 w-full mt-4" onClick={() => { setEditing(null); toast.success("Saved"); }}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}
function Row({ label, v }: { label: string; v: React.ReactNode }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>{v}</span></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-xs font-medium">{label}</label><div className="mt-1">{children}</div></div>;
}
