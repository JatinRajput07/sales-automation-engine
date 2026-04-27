import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/button';
import { useAuthStore, ModuleAccess as IModuleAccess } from '@/store/authStore';
import { Shield, Plus, Lock, Eye, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MODULES } from '@/lib/modules';

export default function ModuleAccess() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  // Mock employees list
  const [employees, setEmployees] = useState([
    { id: 'usr_001', name: 'Rahul Sharma', email: 'rahul.s@example.com', department: 'Sales', access: [{ moduleId: 'sales', isAdmin: true }, { moduleId: 'pms', isAdmin: false }] },
    { id: 'usr_002', name: 'Priya Mehta', email: 'priya.m@example.com', department: 'Sales', access: [{ moduleId: 'sales', isAdmin: false }] },
    { id: 'usr_003', name: 'Amit Singh', email: 'amit.s@example.com', department: 'Engineering', access: [{ moduleId: 'pms', isAdmin: false }, { moduleId: 'hrms', isAdmin: false }] },
  ]);

  if (!user) return null;

  const [selectedEmp, setSelectedEmp] = useState(employees[0].id);
  const activeEmp = employees.find(e => e.id === selectedEmp);

  const toggleModuleAccess = (moduleId: string) => {
    if (!activeEmp) return;
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== selectedEmp) return emp;
      const hasAccess = emp.access.some(a => a.moduleId === moduleId);
      return {
        ...emp,
        access: hasAccess 
          ? emp.access.filter(a => a.moduleId !== moduleId) 
          : [...emp.access, { moduleId, isAdmin: false }]
      };
    }));
  };

  const toggleModuleAdmin = (moduleId: string) => {
    if (!activeEmp) return;
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== selectedEmp) return emp;
      return {
        ...emp,
        access: emp.access.map(a => 
          a.moduleId === moduleId ? { ...a, isAdmin: !a.isAdmin } : a
        )
      };
    }));
  };

  const handleSave = () => {
    toast({ title: 'Access Updated', description: 'Module access settings saved successfully.' });
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <ModuleHeader title="Module Access Management" subtitle="HR Admin control for L1 module visibility" accentVar="--mod-hrms" />
      
      <div className="flex-1 overflow-hidden flex p-4 gap-4">
        {/* Left: Employee List */}
        <div className="w-1/3 bg-surface border border-border rounded-lg flex flex-col">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold mb-2">Employees</h3>
            <input type="text" placeholder="Search employees..." className="w-full h-8 px-3 text-xs bg-surface-hover border border-border rounded-sm" />
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {employees.map(emp => (
              <button 
                key={emp.id} 
                onClick={() => setSelectedEmp(emp.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${selectedEmp === emp.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-surface-hover border border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <div className="font-medium">{emp.name}</div>
                <div className="text-2xs opacity-70 mt-0.5">{emp.department} • {emp.access.length} modules</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Module Assignment */}
        <div className="flex-1 bg-surface border border-border rounded-lg flex flex-col">
          {activeEmp ? (
            <>
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                <div>
                  <h3 className="text-base font-semibold">{activeEmp.name}'s Access</h3>
                  <p className="text-xs text-muted-foreground">{activeEmp.email}</p>
                </div>
                <Button size="sm" onClick={handleSave} className="gap-2 text-xs h-8">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MODULES.map(mod => {
                    const accessRecord = activeEmp.access.find(a => a.moduleId === mod.key);
                    const hasAccess = !!accessRecord;
                    const isSystemAdmin = mod.key === 'sysadmin';
                    
                    return (
                      <div key={mod.key} className={`p-4 rounded-lg border transition-colors flex flex-col gap-4 ${hasAccess ? 'border-primary/50 bg-primary/5' : 'border-border bg-surface-hover'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${hasAccess ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-muted-foreground'}`}>
                              <mod.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{mod.name}</div>
                              <div className="text-xs text-muted-foreground">{mod.short} Module</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Switch 
                              checked={hasAccess} 
                              onCheckedChange={() => toggleModuleAccess(mod.key)}
                              disabled={isSystemAdmin} // System admin is separate layer
                            />
                            {hasAccess && !isSystemAdmin && (
                              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Granted</span>
                            )}
                          </div>
                        </div>

                        {/* Module Admin Toggle */}
                        {hasAccess && !isSystemAdmin && (
                          <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-semibold flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" /> Make Module Admin
                              </div>
                              <p className="text-[10px] text-muted-foreground">Allows user to manage L2 roles and matrix</p>
                            </div>
                            <Switch 
                              checked={accessRecord.isAdmin}
                              onCheckedChange={() => toggleModuleAdmin(mod.key)}
                              className="scale-75 origin-right"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Shield className="w-12 h-12 mb-4 opacity-20" />
              <p>Select an employee to manage module access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
