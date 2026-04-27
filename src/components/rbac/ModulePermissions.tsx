import { useState } from 'react';
import { Shield, Users, Lock, Save, Plus } from 'lucide-react';
import { useAuthStore, ModuleRole } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PEOPLE } from '@/lib/mockData';
import { Switch } from '@/components/ui/switch';

const ROLES: ModuleRole[] = ['MODULE_ADMIN', 'MANAGER', 'TEAM_LEAD', 'EMPLOYEE', 'VIEWER'];
const L2_PAGES_MAP: Record<string, string[]> = {
  sales: ['dashboard', 'leads', 'pipeline', 'deals', 'contacts', 'companies', 'activities', 'forecasts', 'proposals', 'sources', 'automations', 'reports', 'settings', 'permissions'],
  hrms: ['dashboard', 'directory', 'attendance', 'leaves', 'payroll', 'recruitment', 'performance', 'module-access'],
  pms: ['dashboard', 'projects', 'tasks', 'timesheets', 'reports']
};

export function ModulePermissions({ moduleId }: { moduleId: string }) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<'members' | 'roles' | 'templates'>('members');
  const [selectedRole, setSelectedRole] = useState<ModuleRole>('EMPLOYEE');

  // Mock members for this module
  const [members, setMembers] = useState([
    { id: 'usr_002', name: 'Priya Mehta', department: 'Sales', team: 'Enterprise Sales', role: 'MODULE_ADMIN' },
    { id: 'usr_001', name: 'Rahul Sharma', department: 'Sales', team: 'Enterprise Sales', role: 'EMPLOYEE' },
    { id: 'usr_003', name: 'Amit Singh', department: 'Sales', team: 'SMB Sales', role: 'TEAM_LEAD' },
  ]);

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole as ModuleRole } : m));
    toast({ title: 'Role Updated', description: `User role changed to ${newRole}` });
  };

  if (!user) return null;

  const pages = L2_PAGES_MAP[moduleId] || [];

  return (
    <div className="bg-surface border border-border rounded-lg flex flex-col h-[700px]">
      {/* Header */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold capitalize">{moduleId} Module Permissions</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Member
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1" onClick={() => toast({ title: 'Changes Saved' })}>
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="h-10 px-4 border-b border-border flex items-center gap-4 text-xs font-medium shrink-0 bg-surface/50">
        <button onClick={() => setTab('members')} className={`h-full border-b-2 px-1 ${tab === 'members' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Members & Roles
        </button>
        <button onClick={() => setTab('roles')} className={`h-full border-b-2 px-1 ${tab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Role Configuration
        </button>
        <button onClick={() => setTab('templates')} className={`h-full border-b-2 px-1 ${tab === 'templates' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Permission Templates
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-surface-hover/30">
        
        {tab === 'members' && (
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Team</th>
                  <th className="px-4 py-3 font-medium">Module Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map(m => (
                  <tr key={m.id} className="hover:bg-surface-hover/50">
                    <td className="px-4 py-3 font-medium">{m.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.department}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.team}</td>
                    <td className="px-4 py-3">
                      <Select value={m.role} onValueChange={(v) => handleRoleChange(m.id, v)}>
                        <SelectTrigger className="h-8 w-40 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'roles' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-surface p-3 rounded-md border border-border">
              <span className="text-xs font-medium">Configure Role:</span>
              <div className="flex gap-1">
                {ROLES.map(r => (
                  <button 
                    key={r} 
                    onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 text-xs rounded-sm font-medium transition-colors ${selectedRole === r ? 'bg-primary text-primary-foreground' : 'bg-surface-hover text-muted-foreground hover:text-foreground'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* L2 Pages */}
              <div className="bg-surface border border-border rounded-md p-4 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> L2 Page Access
                </h3>
                <div className="space-y-3">
                  {pages.map(page => {
                    const isPerm = page === 'permissions';
                    const forcedOff = isPerm && selectedRole !== 'MODULE_ADMIN';
                    return (
                      <div key={page} className="flex items-center justify-between text-xs">
                        <span className="capitalize">{page}</span>
                        <Switch 
                          checked={selectedRole === 'MODULE_ADMIN' || (!forcedOff && ['dashboard', 'leads', 'pipeline'].includes(page))} 
                          disabled={forcedOff || selectedRole === 'MODULE_ADMIN'} 
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Matrix */}
              <div className="lg:col-span-3 bg-surface border border-border rounded-md overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" /> Action Matrix
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium text-left">Resource</th>
                        <th className="px-2 py-3 font-medium text-muted-foreground">View</th>
                        <th className="px-2 py-3 font-medium text-muted-foreground">Create</th>
                        <th className="px-2 py-3 font-medium text-muted-foreground">Edit</th>
                        <th className="px-2 py-3 font-medium text-muted-foreground">Delete</th>
                        <th className="px-2 py-3 font-medium text-muted-foreground">Export</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {['leads', 'deals', 'contacts', 'companies', 'activities', 'proposals'].map(res => (
                        <tr key={res} className="hover:bg-surface-hover/30">
                          <td className="px-4 py-3 font-medium text-left capitalize">{res}</td>
                          {['view', 'create', 'edit', 'delete', 'export'].map(action => {
                            const isAllowed = selectedRole === 'MODULE_ADMIN' || (selectedRole !== 'VIEWER' && action !== 'delete' && action !== 'export');
                            const scope = selectedRole === 'EMPLOYEE' ? 'own' : 'team';
                            return (
                              <td key={action} className="px-2 py-2">
                                <button className={`w-full py-1.5 rounded text-2xs font-mono font-medium border ${isAllowed ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-surface-hover text-muted-foreground'}`}>
                                  {isAllowed ? (selectedRole === 'MODULE_ADMIN' ? 'ALL' : scope.toUpperCase()) : '❌'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-md p-4 hover:border-primary/50 transition-colors">
              <h3 className="text-sm font-semibold mb-1">Sales Executive</h3>
              <p className="text-xs text-muted-foreground mb-4">Standard access for sales representatives (own records only).</p>
              <Button size="sm" variant="outline" className="w-full text-xs h-8">Apply Template</Button>
            </div>
            <div className="bg-surface border border-border rounded-md p-4 hover:border-primary/50 transition-colors">
              <h3 className="text-sm font-semibold mb-1">Sales Manager</h3>
              <p className="text-xs text-muted-foreground mb-4">Full team visibility with export and approval rights.</p>
              <Button size="sm" variant="outline" className="w-full text-xs h-8">Apply Template</Button>
            </div>
            <div className="bg-surface border border-border rounded-md p-4 hover:border-primary/50 transition-colors border-dashed bg-transparent flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-hover/50 h-32">
              <Plus className="w-5 h-5 text-muted-foreground mb-2" />
              <span className="text-xs font-medium">Create Custom Template</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
