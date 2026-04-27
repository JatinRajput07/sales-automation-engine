import { useState } from 'react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter, ShieldAlert, Key, UserPlus, UserMinus, Shield } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorEmail: string;
  action: 'ROLE_CHANGED' | 'ACCESS_GRANTED' | 'ACCESS_REVOKED' | 'LOGIN_ATTEMPT' | 'SETTINGS_CHANGED';
  resource: string;
  details: string;
  ip: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

const MOCK_LOGS: AuditLog[] = [
  { id: 'al_001', timestamp: '2026-04-26 14:32:10', actor: 'HR Admin', actorEmail: 'hr@example.com', action: 'ACCESS_GRANTED', resource: 'Sales Module', details: 'Granted access to Rahul Sharma', ip: '192.168.1.105', status: 'SUCCESS' },
  { id: 'al_002', timestamp: '2026-04-26 14:15:00', actor: 'System Admin', actorEmail: 'sys@example.com', action: 'ROLE_CHANGED', resource: 'HRMS Module', details: 'Changed Priya Mehta role to MODULE_ADMIN', ip: '192.168.1.100', status: 'SUCCESS' },
  { id: 'al_003', timestamp: '2026-04-26 13:45:22', actor: 'Unknown', actorEmail: 'unknown', action: 'LOGIN_ATTEMPT', resource: 'Auth Service', details: 'Failed login attempt for hr@example.com', ip: '203.0.113.45', status: 'FAILURE' },
  { id: 'al_004', timestamp: '2026-04-26 11:20:05', actor: 'Module Admin (Sales)', actorEmail: 'sales.admin@example.com', action: 'SETTINGS_CHANGED', resource: 'Sales Matrix', details: 'Updated export permissions for TEAM_LEAD', ip: '192.168.1.112', status: 'WARNING' },
  { id: 'al_005', timestamp: '2026-04-25 16:00:12', actor: 'HR Admin', actorEmail: 'hr@example.com', action: 'ACCESS_REVOKED', resource: 'Finance Module', details: 'Revoked access for Amit Singh', ip: '192.168.1.105', status: 'SUCCESS' },
];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'ACCESS_GRANTED': return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'ACCESS_REVOKED': return <UserMinus className="w-4 h-4 text-red-500" />;
      case 'ROLE_CHANGED': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'LOGIN_ATTEMPT': return <Key className="w-4 h-4 text-amber-500" />;
      default: return <ShieldAlert className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'FAILURE': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'WARNING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-muted-foreground bg-surface-hover border-border';
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <ModuleHeader title="Security & Audit Logs" subtitle="Track system-wide RBAC changes and security events" accentVar="--mod-sysadmin" />
      
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search actor or details..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Filter Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="ROLE_CHANGED">Role Changed</SelectItem>
                <SelectItem value="ACCESS_GRANTED">Access Granted</SelectItem>
                <SelectItem value="ACCESS_REVOKED">Access Revoked</SelectItem>
                <SelectItem value="LOGIN_ATTEMPT">Login Attempts</SelectItem>
                <SelectItem value="SETTINGS_CHANGED">Settings Changed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-2 text-xs">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        {/* Logs Table */}
        <div className="flex-1 bg-surface border border-border rounded-lg overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Timestamp</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actor</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Resource</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Details</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">IP Address</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{log.actor}</div>
                    <div className="text-[10px] text-muted-foreground">{log.actorEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="font-medium">{log.action.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.resource}</td>
                  <td className="px-4 py-3 text-foreground">{log.details}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{log.ip}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-sm text-[10px] font-bold tracking-wider border ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
