import { Link } from "react-router-dom";
import { Plus, Star } from "lucide-react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { useSuperAdminStore, formatINR, ALL_MODULES } from "@/store/superAdminStore";

export default function Plans() {
  const { plans, tenants } = useSuperAdminStore();

  return (
    <div className="pb-8">
      <SAPageHeader title="Plan Management" subtitle={`${plans.length} plans configured`}
        actions={<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700"><Plus className="w-3.5 h-3.5 mr-1.5" />New Plan</Button>}
      />
      <div className="px-6 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(p => {
          const planTenants = tenants.filter(t => t.plan === p.code);
          const planMrr = planTenants.reduce((s, t) => s + t.mrr, 0);
          return (
            <div key={p.id} className="bg-white border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">{p.name}</h3>
                {p.code === "growth" && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
              </div>
              <div className="text-2xl font-mono font-semibold">{p.code === "enterprise" ? "Custom" : `${formatINR(p.price)}`}<span className="text-2xs text-muted-foreground font-sans"> /{p.cycle}</span></div>
              <div className="mt-3 text-xs text-muted-foreground space-y-1">
                <div>{planTenants.length} tenants • MRR: {formatINR(planMrr)}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-xs">
                <Row label="Users" v={p.maxUsers ? `${p.maxUsers} max` : "Unlimited"} />
                <Row label="Modules" v={p.maxModules ? `${p.maxModules}` : "All"} />
                <Row label="Storage" v={`${p.storageGb} GB`} />
                <Row label="API/month" v={p.apiPerMonth.toLocaleString()} />
                <Row label="Support" v={p.support} />
              </div>
              <div className="mt-3">
                <div className="text-2xs text-muted-foreground mb-1">Modules allowed:</div>
                <div className="flex flex-wrap gap-1">
                  {p.modules.map(m => <span key={m} className="text-2xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">{ALL_MODULES.find(x => x.id === m)?.name}</span>)}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                <Link to="/super-admin/tenants" className="flex-1"><Button size="sm" variant="outline" className="w-full">View Tenants</Button></Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Row({ label, v }: { label: string; v: React.ReactNode }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{v}</span></div>;
}
