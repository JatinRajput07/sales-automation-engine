import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/ui/StatusPill";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useHrmsStore, fullName, type AttendanceStatus } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";

export default function Attendance() {
  const employees = useHrmsStore((s) => s.employees);
  const departments = useHrmsStore((s) => s.departments);
  const teams = useHrmsStore((s) => s.teams);
  const attendance = useHrmsStore((s) => s.attendance);
  const upsert = useHrmsStore((s) => s.upsertAttendance);
  const { toast } = useToast();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [open, setOpen] = useState(false);
  const [eId, setEid] = useState(employees[0]?.id || "");
  const [status, setStatus] = useState<AttendanceStatus>("Present");
  const [checkIn, setCi] = useState("09:30");
  const [checkOut, setCo] = useState("18:30");
  const [note, setNote] = useState("");

  const todays = attendance.filter((a) => a.date === date);
  const present = todays.filter((a) => a.status === "Present").length;
  const absent = todays.filter((a) => a.status === "Absent").length;
  const late = todays.filter((a) => a.status === "Late").length;
  const wfh = todays.filter((a) => a.status === "WFH").length;

  function save() {
    if (!eId) return;
    upsert({ employeeId: eId, date, status, checkIn, checkOut, mode: "Manual", note });
    toast({ title: "✅ Attendance saved" });
    setOpen(false);
  }

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Attendance"
        subtitle={`Today: ${present} Present · ${absent} Absent · ${late} Late · ${wfh} WFH`}
        accentVar="--mod-hrms"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="h-7">Mark Attendance</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Mark Attendance</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <div className="space-y-1"><Label className="text-2xs">Employee</Label>
                  <Select value={eId} onValueChange={setEid}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-2xs">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8" /></div>
                  <div className="space-y-1"><Label className="text-2xs">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as AttendanceStatus)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Present","Absent","WFH","Half Day","Late"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label className="text-2xs">Check-in</Label><Input type="time" value={checkIn} onChange={(e) => setCi(e.target.value)} className="h-8" /></div>
                  <div className="space-y-1"><Label className="text-2xs">Check-out</Label><Input type="time" value={checkOut} onChange={(e) => setCo(e.target.value)} className="h-8" /></div>
                </div>
                <div className="space-y-1"><Label className="text-2xs">Note</Label><Input value={note} onChange={(e) => setNote(e.target.value)} className="h-8" /></div>
              </div>
              <DialogFooter><Button size="sm" onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <Label className="text-xs">Date:</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-7 w-40 text-xs" />
      </div>
      <div className="p-3">
        <div className="border border-border rounded-md bg-surface overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-2xs uppercase text-muted-foreground tracking-wider">
                <th className="text-left px-3 h-8">Emp ID</th>
                <th className="text-left px-3 h-8">Name</th>
                <th className="text-left px-3 h-8">Dept</th>
                <th className="text-left px-3 h-8">Team</th>
                <th className="text-left px-3 h-8">Check-in</th>
                <th className="text-left px-3 h-8">Check-out</th>
                <th className="text-left px-3 h-8">Status</th>
                <th className="text-left px-3 h-8">Mode</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const att = todays.find((a) => a.employeeId === e.id);
                const dept = departments.find((d) => e.departments.some((x) => x.departmentId === d.id));
                const team = teams.find((t) => e.teams.some((x) => x.teamId === t.id));
                return (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-3 h-8 font-mono text-2xs">{e.empCode}</td>
                    <td className="px-3 h-8">{fullName(e)}</td>
                    <td className="px-3 h-8">{dept?.name || "—"}</td>
                    <td className="px-3 h-8">{team?.name || "—"}</td>
                    <td className="px-3 h-8 font-mono text-2xs">{att?.checkIn || "—"}</td>
                    <td className="px-3 h-8 font-mono text-2xs">{att?.checkOut || "—"}</td>
                    <td className="px-3 h-8">{att ? <StatusPill variant={att.status === "Present" ? "success" : att.status === "Absent" ? "danger" : "info"}>{att.status}</StatusPill> : <StatusPill variant="neutral">No record</StatusPill>}</td>
                    <td className="px-3 h-8">{att?.mode || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
