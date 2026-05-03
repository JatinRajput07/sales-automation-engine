import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSuperAdminStore, formatINR, ALL_MODULES, type ModuleId } from "@/store/superAdminStore";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700", negotiating: "bg-amber-100 text-amber-800", expired: "bg-gray-100 text-gray-600", cancelled: "bg-red-100 text-red-700",
};

export default function CustomDeals() {
  const navigate = useNavigate();
  const { customDeals, tenants } = useSuperAdminStore();
  const [showNew, setShowNew] = useState(false);
  const counts = {
    active: customDeals.filter(d => d.status === "active").length,
    negotiating: customDeals.filter(d => d.status === "negotiating").length,
    expired: customDeals.filter(d => d.status === "expired").length,
  };
  const customMrr = customDeals.filter(d => d.status === "active").reduce((s, d) => s + d.customPrice, 0);

  return (
    <div className="pb-8">
      <SAPageHeader title="Custom Deals" subtitle={`Active: ${counts.active} • Negotiating: ${counts.negotiating} • Expired: ${counts.expired}  |  Custom MRR: ${formatINR(customMrr)}`}
        actions={<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowNew(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />New Custom Deal</Button>}
      />
      <div className="px-6 pt-4">
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-2xs uppercase text-muted-foreground"><tr>
              <th className="text-left px-3 h-9">Deal #</th><th className="text-left px-3">Tenant</th><th className="text-left px-3">Modules</th>
              <th className="text-right px-3">Custom Price</th><th className="text-left px-3">Started</th><th className="text-left px-3">Expires</th>
              <th className="text-left px-3">Status</th><th className="text-left px-3">Owner</th>
            </tr></thead>
            <tbody>
              {customDeals.map(d => {
                const t = tenants.find(x => x.id === d.tenantId);
                return (
                  <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono">{d.number}</td>
                    <td className="px-3 font-medium">{t?.name || "—"}</td>
                    <td className="px-3"><div className="flex flex-wrap gap-1">{d.modules.map(m => <span key={m.id} className="text-2xs px-1.5 rounded bg-indigo-50 text-indigo-700">{ALL_MODULES.find(x => x.id === m.id)?.name}</span>)}</div></td>
                    <td className="px-3 text-right font-mono">{formatINR(d.customPrice)}/{d.cycle === "monthly" ? "mo" : "yr"}</td>
                    <td className="px-3">{new Date(d.startDate).toLocaleDateString()}</td>
                    <td className="px-3">{new Date(d.endDate).toLocaleDateString()}</td>
                    <td className="px-3"><span className={`px-1.5 py-0.5 rounded text-2xs ${statusColors[d.status]}`}>{d.status}</span></td>
                    <td className="px-3 text-2xs">{d.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && <NewDealModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewDealModal({ onClose }: { onClose: () => void }) {
  const { tenants, addCustomDeal, updateTenant } = useSuperAdminStore();
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState(tenants[0]?.id || "");
  const [owner, setOwner] = useState("Rahul S");
  const [mods, setMods] = useState<Record<ModuleId, { on: boolean; price: number }>>(
    Object.fromEntries(ALL_MODULES.map(m => [m.id, { on: false, price: m.defaultPrice }])) as any
  );
  const [discount, setDiscount] = useState(0);
  const [cycle, setCycle] = useState<"monthly"|"annual">("monthly");
  const [duration, setDuration] = useState("1 year");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0,10));
  const [autoRenew, setAutoRenew] = useState(true);
  const [terms, setTerms] = useState("Net 30");
  const [notes, setNotes] = useState("");
  const [overridePrice, setOverridePrice] = useState<number | "">("");

  const standardPrice = useMemo(() => Object.values(mods).filter(m => m.on).reduce((s, m) => s + m.price, 0), [mods]);
  const computedPrice = overridePrice !== "" ? Number(overridePrice) : Math.round(standardPrice * (1 - discount / 100));
  const computedDiscount = standardPrice > 0 ? Math.round((1 - computedPrice/standardPrice) * 100) : 0;

  const submit = () => {
    if (!name || !tenantId) return toast.error("Name and tenant required");
    const selected = ALL_MODULES.filter(m => mods[m.id].on).map(m => ({ id: m.id, price: mods[m.id].price }));
    if (selected.length === 0) return toast.error("Select at least one module");
    const id = crypto.randomUUID();
    const days = duration.includes("year") ? parseInt(duration) * 365 : duration.includes("month") ? parseInt(duration) * 30 : 30;
    addCustomDeal({
      id, number: `CD-${String(Math.floor(Math.random()*9999)).padStart(4,"0")}`, name, tenantId, owner,
      modules: selected, standardPrice, customPrice: computedPrice, discountPct: computedDiscount,
      cycle, duration, startDate: new Date(startDate).toISOString(), endDate: new Date(Date.now() + days * 86400000).toISOString(),
      autoRenew, paymentTerms: terms, status: "active", notes,
    });
    updateTenant(tenantId, { plan: "custom", modules: selected.map(m => m.id), mrr: computedPrice, customDealId: id });
    toast.success(`✅ Custom deal created — ${selected.length} modules provisioned`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold">New Custom Deal</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>×</Button>
        </div>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-auto">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deal Name *"><Input value={name} onChange={e => setName(e.target.value)} placeholder="Wipro PMS+HRMS Bundle" /></Field>
            <Field label="Tenant *">
              <select value={tenantId} onChange={e => setTenantId(e.target.value)} className="h-9 w-full px-2 text-sm border border-border rounded-md">
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Deal Owner"><Input value={owner} onChange={e => setOwner(e.target.value)} /></Field>
            <Field label="Billing Cycle">
              <select value={cycle} onChange={e => setCycle(e.target.value as any)} className="h-9 w-full px-2 text-sm border border-border rounded-md">
                <option value="monthly">Monthly</option><option value="annual">Annual</option>
              </select>
            </Field>
          </div>

          <div>
            <Label className="text-xs">Modules</Label>
            <div className="mt-2 border border-border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-2xs uppercase text-muted-foreground"><tr>
                  <th className="px-3 h-8 text-left">Module</th><th className="px-3 text-left">Include</th><th className="px-3 text-right">Price (₹/mo)</th>
                </tr></thead>
                <tbody>
                  {ALL_MODULES.map(m => (
                    <tr key={m.id} className="border-t border-border">
                      <td className="px-3 py-2">{m.name}</td>
                      <td className="px-3"><input type="checkbox" checked={mods[m.id].on} onChange={e => setMods(s => ({ ...s, [m.id]: { ...s[m.id], on: e.target.checked } }))} /></td>
                      <td className="px-3 text-right"><Input type="number" value={mods[m.id].price} onChange={e => setMods(s => ({ ...s, [m.id]: { ...s[m.id], price: +e.target.value } }))} className="h-7 w-24 text-right inline-block" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-muted/40 rounded-md p-3 space-y-2 text-xs">
            <div className="flex justify-between"><span>Standard Price</span><span className="font-mono">{formatINR(standardPrice)}/mo</span></div>
            <div className="flex items-center gap-2">
              <span>Discount</span>
              <input type="range" min={0} max={60} value={discount} onChange={e => { setDiscount(+e.target.value); setOverridePrice(""); }} className="flex-1" />
              <span className="w-10 text-right font-mono">{computedDiscount}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Override Total</span>
              <Input type="number" value={overridePrice} onChange={e => setOverridePrice(e.target.value === "" ? "" : +e.target.value)} className="h-7 w-32" placeholder="optional" />
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-border"><span className="font-semibold">Custom Deal Price</span><span className="font-mono font-semibold text-indigo-600">{formatINR(computedPrice)}/{cycle === "monthly" ? "mo" : "yr"}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contract Duration">
              <select value={duration} onChange={e => setDuration(e.target.value)} className="h-9 w-full px-2 text-sm border border-border rounded-md">
                {["3 months","6 months","1 year","2 years","Month-to-month"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Start Date"><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></Field>
            <Field label="Payment Terms">
              <select value={terms} onChange={e => setTerms(e.target.value)} className="h-9 w-full px-2 text-sm border border-border rounded-md">
                <option>Advance</option><option>Net 15</option><option>Net 30</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 mt-6 text-xs"><input type="checkbox" checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)} /> Auto-renewal</label>
          </div>

          <Field label="Deal Notes"><Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} /></Field>
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={submit}>Save + Provision Modules</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs">{label}</Label><div className="mt-1">{children}</div></div>;
}
