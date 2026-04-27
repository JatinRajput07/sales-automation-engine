import { ReactNode } from 'react';
import { usePermission, usePageAccess, useModuleRole } from '@/hooks/usePermission';
import { Permission, ModuleRole } from '@/store/authStore';
import { UnauthorizedState } from './UnauthorizedState';

export function Can({
  action, 
  resource, 
  module, 
  children, 
  fallback = null
}: {
  action: Permission['action'];
  resource: string;
  module?: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const allowed = usePermission(action, resource, module);
  return allowed ? <>{children}</> : <>{fallback}</>;
}

export function PageGuard({ 
  page, 
  module, 
  children 
}: {
  page: string;
  module?: string;
  children: ReactNode;
}) {
  const allowed = usePageAccess(page, module);
  if (!allowed) return <UnauthorizedState page={page} />;
  return <>{children}</>;
}

export function RoleGuard({ 
  roles, 
  children, 
  fallback = null 
}: {
  roles: ModuleRole[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const role = useModuleRole();
  return role && roles.includes(role) ? <>{children}</> : <>{fallback}</>;
}
