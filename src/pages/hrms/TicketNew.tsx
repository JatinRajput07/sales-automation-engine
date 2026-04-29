import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHrmsStore, fullName, type TicketCategory, type TicketPriority } from "@/store/hrmsStore";
import { useToast } from "@/hooks/use-toast";

export default function TicketNew() {
  const nav = useNavigate();
  const { toast } = useToast();
  const employees = useHrmsStore((s) => s.employees);
  const addTicket = useHrmsStore((s) => s.addTicket);

  const [employeeId, setEid] = useState(employees[0]?.id || "");
  const [category, setCat] = useState<TicketCategory>("IT Support");
  const [subject, setSubj] = useState("");
  const [description, setDesc] = useState("");
  const [priority, setPri] = useState<TicketPriority>("Medium");

  function submit() {
    if (subject.length < 5 || description.length < 20) {
      toast({ title: "Subject min 5, description min 20 chars", variant: "destructive" });
      return;
    }
    addTicket({ employeeId, category, subject, description, priority });
    toast({ title: "✅ Ticket raised" });
    nav("/hrms/helpdesk");
  }

  return (
    <div className="flex-1 overflow-auto">
      <ModuleHeader
        title="Raise Ticket"
        accentVar="--mod-hrms"
        actions={
          <>
            <Link to="/hrms/helpdesk"><Button size="sm" variant="ghost" className="h-7 gap-1.5"><ArrowLeft className="w-3.5 h-3.5" />Back</Button></Link>
            <Button size="sm" className="h-7" onClick={submit}>Submit</Button>
          </>
        }
      />
      <div className="p-3 max-w-2xl">
        <div className="border border-border rounded-md bg-surface p-3 space-y-2">
          <div className="space-y-1"><Label className="text-2xs">Employee</Label>
            <Select value={employeeId} onValueChange={setEid}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{fullName(e)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-2xs">Category *</Label>
            <Select value={category} onValueChange={(v) => setCat(v as TicketCategory)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{["Payroll Issue","Leave Query","Policy Clarification","IT Support","Attendance Correction","Other"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-2xs">Subject * (min 5)</Label><Input value={subject} onChange={(e) => setSubj(e.target.value)} className="h-8" /></div>
          <div className="space-y-1"><Label className="text-2xs">Description * (min 20)</Label><Textarea value={description} onChange={(e) => setDesc(e.target.value)} className="min-h-[100px]" /></div>
          <div className="space-y-1"><Label className="text-2xs">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPri(v as TicketPriority)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{["High","Medium","Low"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
