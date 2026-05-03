import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Download, Upload } from "lucide-react";
import { SAPageHeader } from "@/components/superadmin/SuperAdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuperAdminStore, formatINR, ALL_MODULES, type PlanCode, type TenantStatus } from "@/store/superAdminStore";
import { toast } from "sonner";

const planBadge: Record<PlanCode, string> = {
  trial: "bg-gray-100 text-gray-700",
  starter: "bg-blue-100 text-blue-700",
  growth: "bg-teal-100 text-teal-700",
  pro: "bg-purple-100 text-purple-700",
  enterprise: "bg-indigo-100 text-indigo-700",
  custom: "bg-amber-100 text-amber-800",
};
const statusBadge: Record<TenantStatus, string> = {
  active: "bg-green-100 text-green-700",
  trial: "bg-blue-100 text-blue-700",
  suspended: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  payment_failed: "bg-red-50 text-red-700 border border-red-300",
};

export default function Tenants() {
  const navigate = useNavigate();
  const { tenants, suspendTenant, setImpersonating } = useSuperAdminStore();
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => tenants.filter(t => {
    if (q && !t.name.toLowerCase().includes(q.toLowerCase()) && !t.slug.includes(q.toLowerCase())) return false;
    if (planFilter && t.plan !== planFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  }), [tenants, q, planFilter, statusFilter]);

  const paged = filtered.slice((page-1)*pageSize, page*pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const counts = {
    active: tenants.filter(t => t.status === "active").length,
    trial: tenants.filter(t => t.status === "trial").length,
    suspended: tenants.filter(t => t.status === "suspended").length,
    total: tenants.length,
  };
  const mrr = tenants.filter(t => t.status === "active").reduce((s,t) => s+t.mrr, 0);

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(t => t.id)));
  };
  const toggleOne = (id: string) => {
    const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n);
  };

  const impersonate = (id: string) => {
    setImpersonating(id);
    const t = tenants.find(x => x.id === id);
    toast.success(`Impersonating ${t?.name} — opening CRM in new tab`);
    window.open("/?impersonate=" + id, "_blank");
  };

  return (
    <div className="pb-8">
      <SAPageHeader
        title="All Tenants"
        subtitle={`Active: ${counts.active} • Trial: ${counts.trial} • Suspended: ${counts.suspended} • Total: ${counts.total}  |  MRR: ${formatINR(mrr)} • ARR: ${formatINR(mrr*12)}`}
        actions={
          <>
            <Button variant="outline" size="sm"><Upload className="w-3.5 h-3.5 mr-1.5" />Import</Button>
            <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1.5" />Export</Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/super-admin/tenants/new")}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Add Tenant
            </Button>
          </>
        }
      />

      <div className="px-6 pt-4">
        <div className="bg-white border border-border rounded-lg">
          {/* Filter bar */}
          <div className="px-3 py-2 border-b border-border flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tenants..." className="pl-8 h-8 text-xs" />
            </div>
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="h-8 px-2 text-xs border border-border rounded-md bg-white">
              <option value="">All plans</option>
              {["trial","starter","growth","pro","enterprise","custom"].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 px-2 text-xs border border-border rounded-md bg-white">
              <option value="">All statuses</option>
              {["active","trial","suspended","cancelled","payment_failed"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </select>
            <button onClick={() => { setQ(""); setPlanFilter(""); setStatusFilter(""); }} className="text-2xs text-muted-foreground hover:text-foreground">Clear</button>
            {selected.size > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-2xs text-muted-foreground">{selected.size} selected</span>
                <Button size="sm" variant="outline" onClick={() => toast.info("Email queued")}>Send Email</Button>
                <Button size="sm" variant="outline" onClick={() => { selected.forEach(suspendTenant); setSelected(new Set()); toast.success("Suspended"); }}>Suspend</Button>
              </div>
            )}
          </div>

          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-2xs uppercase text-muted-foreground">
                <th className="px-3 h-9 w-8"><input type="checkbox" checked={selected.size === paged.length && paged.length > 0} onChange={toggleAll} /></th>
                <th className="text-left px-3 font-medium">Org Name</th>
                <th className="text-left px-3 font-medium">Plan</th>
                <th className="text-left px-3 font-medium">Modules</th>
                <th className="text-right px-3 font-medium">Users</th>
                <th className="text-right px-3 font-medium">MRR</th>
                <th className="text-left px-3 font-medium">Status</th>
                <th className="text-left px-3 font-medium">Expires</th>
                <th className="text-right px-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(t => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2"><input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} /></td>
                  <td className="px-3 py-2">
                    <Link to={`/super-admin/tenants/${t.id}`} className="font-medium hover:text-indigo-600">{t.name}</Link>
                    <div className="text-2xs text-muted-foreground">{t.slug}</div>
                  </td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-2xs font-medium capitalize ${planBadge[t.plan]}`}>{t.plan}</span></td>
                  <td className="px-3 py-2">
                    <span className="text-xs cursor-help" title={t.modules.map(m => ALL_MODULES.find(x => x.id === m)?.name).join(", ")}>
                      {t.modules.length} modules
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono">{t.users}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatINR(t.mrr)}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-2xs font-medium ${statusBadge[t.status]}`}>{t.status.replace("_"," ")}</span></td>
                  <td className="px-3 py-2">{new Date(t.expiresAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-right">
                    <Link to={`/super-admin/tenants/${t.id}`} className="text-indigo-600 hover:underline mr-2">View</Link>
                    <button onClick={() => impersonate(t.id)} className="text-indigo-600 hover:underline mr-2">Impersonate</button>
                    <button onClick={() => { suspendTenant(t.id); toast.success("Suspended"); }} className="text-red-600 hover:underline">Suspend</button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={9} className="text-center py-6 text-muted-foreground">No tenants found</td></tr>}
            </tbody>
          </table>

          <div className="px-3 py-2 border-t border-border flex items-center justify-between text-2xs text-muted-foreground">
            <span>Showing {(page-1)*pageSize+1}-{Math.min(page*pageSize, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="px-2 h-6 rounded border border-border disabled:opacity-50">Prev</button>
              <span className="px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="px-2 h-6 rounded border border-border disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
