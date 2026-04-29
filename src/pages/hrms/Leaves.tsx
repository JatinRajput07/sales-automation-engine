import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Download, Search } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useHrmsStore, fullName, type LeaveRequest, type LeaveStatus } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";

export default function Leaves() {
  const leaves = useHrmsStore((s) => s.leaves);
  const employees = useHrmsStore((s) => s.employees);
  const setLeaveStatus = useHrmsStore((s) => s.setLeaveStatus);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LeaveStatus | "all">("all");

  const filtered = useMemo(() => {
    let out = leaves;
    if (filter !== "all") out = out.filter((l) => l.status === filter);
    if (search) {
      const s = search.toLowerCase();
      out = out.filter((l) => fullName(employees.find((e) => e.id === l.employeeId)).toLowerCase().includes(s));
    }
    return out;
  }, [leaves, filter, search, employees]);

  const cols: Column<LeaveRequest>[] = [
    { key: "name", label: "Employee", render: (l) => fullName(employees.find((e) => e.id === l.employeeId)) },
    { key: "type", label: "Type", render: (l) => <StatusPill variant="info">{l.type}</StatusPill> },
    { key: "from", label: "From", render: (l) => <span className="font-mono text-2xs">{l.fromDate}</span> },
    { key: "to", label: "To", render: (l) => <span className="font-mono text-2xs">{l.toDate}</span> },
    { key: "days", label: "Days", align: "right", render: (l) => l.days },
    { key: "reason", label: "Reason", render: (l) => <span className="truncate max-w-[200px] inline-block">{l.reason}</span> },
    { key: "status", label: "Status", render: (l) => <StatusPill variant={l.status === "Approved" ? "success" : l.status === "Rejected" ? "danger" : l.status === "Cancelled" ? "neutral" : "warning"}>{l.status}</StatusPill> },
    { key: "actions", label: "Actions", render: (l) => (
      l.status === "Pending" ? (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 text-2xs" onClick={() => { setLeaveStatus(l.id, "Approved"); toast({ title: "Approved" }); }}>Approve</Button>
          <Button size="sm" variant="outline" className="h-6 text-2xs text-destructive" onClick={() => { const r = prompt("Reason?") || ""; setLeaveStatus(l.id, "Rejected", undefined, r); toast({ title: "Rejected" }); }}>Reject</Button>
        </div>
      ) : <span className="text-2xs text-muted-foreground">—</span>
    ) },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Leaves"
        subtitle={`Pending: ${leaves.filter((l) => l.status === "Pending").length} · Approved: ${leaves.filter((l) => l.status === "Approved").length}`}
        accentVar="--mod-hrms"
        actions={
          <>
            <Button size="sm" variant="outline" className="h-7 gap-1.5"><Download className="w-3.5 h-3.5" />Export</Button>
            <Link to="/hrms/leaves/apply"><Button size="sm" className="h-7 gap-1.5"><Plus className="w-3.5 h-3.5" />Apply Leave</Button></Link>
          </>
        }
      />
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="h-7 pl-7 text-xs" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {["Pending","Approved","Rejected","Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="p-3"><DataTable rows={filtered} columns={cols} rowKey={(l) => l.id} /></div>
    </div>
  );
}
