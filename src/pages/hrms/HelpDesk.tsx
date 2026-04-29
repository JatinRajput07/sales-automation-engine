import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/StatusPill";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useHrmsStore, fullName, type HelpTicket } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";

export default function HelpDesk() {
  const tickets = useHrmsStore((s) => s.tickets);
  const employees = useHrmsStore((s) => s.employees);
  const updateTicket = useHrmsStore((s) => s.updateTicket);
  const { toast } = useToast();

  const cols: Column<HelpTicket>[] = [
    { key: "num", label: "Ticket #", render: (t) => <span className="font-mono text-2xs">{t.number}</span> },
    { key: "emp", label: "Employee", render: (t) => fullName(employees.find((e) => e.id === t.employeeId)) },
    { key: "cat", label: "Category", render: (t) => t.category },
    { key: "subj", label: "Subject", render: (t) => <span className="font-medium">{t.subject}</span> },
    { key: "pri", label: "Priority", render: (t) => <StatusPill variant={t.priority === "High" ? "danger" : t.priority === "Medium" ? "warning" : "neutral"}>{t.priority}</StatusPill> },
    { key: "stat", label: "Status", render: (t) => <StatusPill variant={t.status === "Resolved" || t.status === "Closed" ? "success" : t.status === "Open" ? "warning" : "info"}>{t.status}</StatusPill> },
    { key: "ass", label: "Assigned To", render: (t) => fullName(employees.find((e) => e.id === t.assignedToId)) },
    { key: "act", label: "Actions", render: (t) => (
      <div className="flex gap-1">
        {t.status !== "Resolved" && t.status !== "Closed" && <Button size="sm" variant="outline" className="h-6 text-2xs" onClick={() => { updateTicket(t.id, { status: "Resolved" }); toast({ title: "Resolved" }); }}>Resolve</Button>}
      </div>
    ) },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Help Desk"
        subtitle={`Open: ${tickets.filter((t) => t.status === "Open").length} · In Progress: ${tickets.filter((t) => t.status === "In Progress").length} · Resolved: ${tickets.filter((t) => t.status === "Resolved").length}`}
        accentVar="--mod-hrms"
        actions={<Link to="/hrms/helpdesk/new"><Button size="sm" className="h-7 gap-1.5"><Plus className="w-3.5 h-3.5" />Raise Ticket</Button></Link>}
      />
      <div className="p-3"><DataTable rows={tickets} columns={cols} rowKey={(t) => t.id} /></div>
    </div>
  );
}
