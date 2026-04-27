import { useAuthStore, Permission, ModuleRole } from '@/store/authStore';

export function usePermission(
  action: Permission['action'],
  resource: string,
  moduleId?: string
): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  
  const activeModule = user.activeModule;
  const mod = moduleId || activeModule;
  
  if (!mod) return false;
  if (user.globalRole === 'SUPER_ADMIN') return true;
  
  const moduleAccess = user.accessibleModules.find(m => m.moduleId === mod);
  if (!moduleAccess) return false;
  
  // If user has wildcard permissions for all actions and resources
  const hasWildcard = moduleAccess.permissions.some(
    p => p.action === action && p.resource === '*'
  );
  if (hasWildcard) return true;

  return moduleAccess.permissions.some(
    p => p.action === action && p.resource === resource
  );
}

export function usePageAccess(pageSlug: string, moduleId?: string): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;

  const activeModule = user.activeModule;
  const mod = moduleId || activeModule;
  
  if (!mod) return false;
  if (user.globalRole === 'SUPER_ADMIN') return true;
  
  const moduleAccess = user.accessibleModules.find(m => m.moduleId === mod);
  if (!moduleAccess) return false;
  
  return moduleAccess.allowedL2Pages.includes(pageSlug);
}

export function useModuleRole(moduleId?: string): ModuleRole | null {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const activeModule = user.activeModule;
  const mod = moduleId || activeModule;
  
  if (!mod) return null;
  const moduleAccess = user.accessibleModules.find(m => m.moduleId === mod);
  return moduleAccess?.moduleRole || null;
}
