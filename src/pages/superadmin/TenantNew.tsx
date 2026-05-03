import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSuperAdminStore, ALL_MODULES, type ModuleId, type PlanCode } from "@/store/superAdminStore";
import { toast } from "sonner";
import { Check } from "lucide-react";

const PLANS: { code: PlanCode; name: string; price: string; users: string; modules: string; support: string; star?: boolean }[] = [
  { code: "starter", name: "Starter", price: "₹999/month", users: "Up to 10 users", modules: "3 modules", support: "Basic support" },
  { code: "growth", name: "Growth", price: "₹2,999/month", users: "Up to 50 users", modules: "6 modules", support: "Priority support", star: true },
  { code: "pro", name: "Pro", price: "₹5,999/month", users: "Up to 200 users", modules: "All modules", support: "Dedicated CSM" },
  { code: "enterprise", name: "Enterprise", price: "Custom", users: "Unlimited", modules: "All modules", support: "SLA + CSM" },
];

export default function TenantNew() {
  const navigate = useNavigate();
  const addTenant = useSuperAdminStore(s => s.addTenant);
  const [form, setForm] = useState({
    name: "", slug: "", email: "", phone: "", industry: "", country: "India", website: "",
    plan: "growth" as PlanCode, cycle: "monthly" as "monthly"|"annual", customPrice: 0,
    modules: ["sales","hrms","pms","finance","wayofwork","mastersheet"] as ModuleId[],
    adminName: "", adminEmail: "", sendWelcome: true,
    paymentMethod: "Auto-charge", startDate: new Date().toISOString().slice(0,10), trial: 0, notes: "",
  });

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const update = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  const toggleMod = (m: ModuleId) => update({ modules: form.modules.includes(m) ? form.modules.filter(x => x !== m) : [...form.modules, m] });

  const submit = () => {
    if (!form.name || !form.email || !form.adminName || !form.adminEmail) { toast.error("Fill required fields"); return; }
    const slug = form.slug || slugify(form.name);
    const planPrice = { starter: 999, growth: 2999, pro: 5999, enterprise: 0, custom: 0, trial: 0 }[form.plan] || 0;
    const mrr = form.customPrice || planPrice;
    addTenant({
      id: crypto.randomUUID(), name: form.name, slug, email: form.email, phone: form.phone, industry: form.industry, country: form.country, website: form.website,
      plan: form.plan, modules: form.modules, users: 1, mrr, status: form.trial > 0 ? "trial" : "active",
      signupAt: new Date().toISOString(), expiresAt: new Date(Date.now() + (form.trial > 0 ? form.trial : 30) * 86400000).toISOString(),
      billingCycle: form.cycle, adminName: form.adminName, adminEmail: form.adminEmail, notes: form.notes,
    });
    toast.success(`✅ ${form.name} created — ${form.modules.length} schemas provisioned`);
    navigate("/super-admin/tenants");
  };

  return (
    <div className="pb-8">
      <SAPageHeader title="Add Tenant" subtitle="Provision a new organization on the platform"
        actions={<>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Cancel</Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={submit}>Create Tenant</Button>
        </>}
      />
      <div className="px-6 pt-4 space-y-4 max-w-5xl">
        <Section title="Organization Info">
          <Grid>
            <Field label="Organization Name *"><Input value={form.name} onChange={e => update({ name: e.target.value, slug: form.slug || slugify(e.target.value) })} /></Field>
            <Field label="Slug *">
              <Input value={form.slug} onChange={e => update({ slug: slugify(e.target.value) })} />
              <p className="text-2xs text-muted-foreground mt-1">app.yourdomain.com/{form.slug || "your-slug"}</p>
            </Field>
            <Field label="Organization Email *"><Input type="email" value={form.email} onChange={e => update({ email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e => update({ phone: e.target.value })} /></Field>
            <Field label="Industry"><Input value={form.industry} onChange={e => update({ industry: e.target.value })} /></Field>
            <Field label="Country *"><Input value={form.country} onChange={e => update({ country: e.target.value })} /></Field>
            <Field label="Website"><Input value={form.website} onChange={e => update({ website: e.target.value })} /></Field>
          </Grid>
        </Section>

        <Section title="Plan Selection">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {PLANS.map(p => (
              <button key={p.code} onClick={() => update({ plan: p.code })} className={`text-left p-4 rounded-lg border-2 transition ${form.plan === p.code ? "border-indigo-600 bg-indigo-50" : "border-border bg-white hover:border-indigo-300"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{p.name}</h4>
                  {p.star && <span className="text-2xs px-1.5 rounded bg-amber-100 text-amber-800">★ Popular</span>}
                </div>
                <div className="text-base font-mono font-semibold">{p.price}</div>
                <div className="mt-2 space-y-1 text-2xs text-muted-foreground">
                  <div>{p.users}</div><div>{p.modules}</div><div>{p.support}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5"><input type="radio" checked={form.cycle === "monthly"} onChange={() => update({ cycle: "monthly" })} /> Monthly</label>
            <label className="flex items-center gap-1.5"><input type="radio" checked={form.cycle === "annual"} onChange={() => update({ cycle: "annual" })} /> Annual <span className="text-green-600 font-medium">Save 20%</span></label>
            <div className="ml-4 flex items-center gap-2">
              <span className="text-muted-foreground">Custom price override:</span>
              <Input type="number" value={form.customPrice || ""} onChange={e => update({ customPrice: +e.target.value })} className="h-7 w-28" placeholder="₹" />
            </div>
          </div>
        </Section>

        <Section title={`Module Selection (${form.modules.length} of ${ALL_MODULES.length} selected)`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ALL_MODULES.map(m => {
              const on = form.modules.includes(m.id);
              return (
                <button key={m.id} onClick={() => toggleMod(m.id)} className={`p-3 rounded-lg border-2 text-left transition ${on ? "border-indigo-600 bg-indigo-50" : "border-border bg-white hover:border-indigo-300"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{m.name}</span>
                    {on && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <div className="text-2xs text-muted-foreground mt-1 font-mono">₹{m.defaultPrice}/mo</div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Admin User (first user of this org)">
          <Grid>
            <Field label="Admin Name *"><Input value={form.adminName} onChange={e => update({ adminName: e.target.value })} /></Field>
            <Field label="Admin Email *"><Input type="email" value={form.adminEmail} onChange={e => update({ adminEmail: e.target.value })} /></Field>
          </Grid>
          <label className="flex items-center gap-2 mt-3 text-xs"><input type="checkbox" checked={form.sendWelcome} onChange={e => update({ sendWelcome: e.target.checked })} /> Send welcome email</label>
        </Section>

        <Section title="Billing">
          <Grid>
            <Field label="Payment Method">
              <select value={form.paymentMethod} onChange={e => update({ paymentMethod: e.target.value })} className="h-9 w-full px-2 text-sm border border-border rounded-md bg-white">
                {["Invoice","Auto-charge","Manual","Free"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Billing Start Date *"><Input type="date" value={form.startDate} onChange={e => update({ startDate: e.target.value })} /></Field>
            <Field label="Trial Period (days)"><Input type="number" value={form.trial} onChange={e => update({ trial: +e.target.value })} /></Field>
          </Grid>
          <Field label="Notes (internal)"><Textarea value={form.notes} onChange={e => update({ notes: e.target.value })} rows={3} /></Field>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-lg p-5">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs">{label}</Label><div className="mt-1">{children}</div></div>;
}
