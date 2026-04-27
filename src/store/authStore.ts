import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Permission {
  action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve' | 'assign';
  resource: string;
  scope: 'own' | 'team' | 'department' | 'all';
}

export type ModuleRole = 'MODULE_ADMIN' | 'MANAGER' | 'TEAM_LEAD' | 'EMPLOYEE' | 'VIEWER';

export interface ModuleAccess {
  moduleId: string;
  moduleName: string;
  isModuleAdmin: boolean;
  moduleRole: ModuleRole;
  allowedL2Pages: string[];
  permissions: Permission[];
}

export interface TeamContext {
  teamId: string;
  teamName: string;
  isPrimary: boolean;
  departmentId: string;
  departmentName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  globalRole: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MODULE_ADMIN' | 'EMPLOYEE';
  accessibleModules: ModuleAccess[];
  activeModule: string | null;
  activeTeam: TeamContext | null;
  activeDepartment: string | null;
}

const mockModuleAdmin: User = {
  id: 'usr_002',
  name: 'Priya Mehta',
  email: 'priya@company.com',
  globalRole: 'MODULE_ADMIN',
  activeModule: 'sales',
  activeTeam: {
    teamId: 'team_001',
    teamName: 'Enterprise Sales',
    isPrimary: true,
    departmentId: 'dept_001',
    departmentName: 'Sales'
  },
  activeDepartment: 'dept_001',
  accessibleModules: [
    {
      moduleId: 'sales',
      moduleName: 'Sales',
      isModuleAdmin: true,
      moduleRole: 'MODULE_ADMIN',
      allowedL2Pages: [
        'dashboard', 'leads', 'pipeline', 'deals', 'contacts', 'companies',
        'activities', 'forecasts', 'proposals', 'sources', 'automations',
        'reports', 'settings', 'permissions'
      ],
      permissions: [
        { action: 'view', resource: '*', scope: 'all' },
        { action: 'create', resource: '*', scope: 'all' },
        { action: 'edit', resource: '*', scope: 'all' },
        { action: 'delete', resource: '*', scope: 'all' },
        { action: 'export', resource: '*', scope: 'all' },
        { action: 'approve', resource: '*', scope: 'all' },
        { action: 'assign', resource: '*', scope: 'all' },
      ]
    },
    {
      moduleId: 'hrms',
      moduleName: 'HRMS',
      isModuleAdmin: false,
      moduleRole: 'EMPLOYEE',
      allowedL2Pages: ['dashboard', 'directory'],
      permissions: [
        { action: 'view', resource: 'directory', scope: 'all' }
      ]
    }
  ]
};

const mockUser: User = {
  id: 'usr_001',
  name: 'Rahul Sharma',
  email: 'rahul@company.com',
  globalRole: 'EMPLOYEE',
  activeModule: 'sales',
  activeTeam: {
    teamId: 'team_001',
    teamName: 'Enterprise Sales',
    isPrimary: true,
    departmentId: 'dept_001',
    departmentName: 'Sales'
  },
  activeDepartment: 'dept_001',
  accessibleModules: [
    {
      moduleId: 'sales',
      moduleName: 'Sales',
      isModuleAdmin: false,
      moduleRole: 'EMPLOYEE',
      allowedL2Pages: ['dashboard', 'leads', 'pipeline', 'deals', 'contacts', 'companies', 'activities'],
      permissions: [
        { action: 'view', resource: 'leads', scope: 'team' },
        { action: 'create', resource: 'leads', scope: 'own' },
        { action: 'edit', resource: 'leads', scope: 'own' },
        { action: 'view', resource: 'deals', scope: 'team' },
        { action: 'create', resource: 'deals', scope: 'own' },
        { action: 'edit', resource: 'deals', scope: 'own' },
        { action: 'view', resource: 'contacts', scope: 'team' },
        { action: 'create', resource: 'contacts', scope: 'own' },
        { action: 'view', resource: 'pipeline', scope: 'team' },
      ]
    },
    {
      moduleId: 'pms',
      moduleName: 'PMS',
      isModuleAdmin: false,
      moduleRole: 'EMPLOYEE',
      allowedL2Pages: ['dashboard', 'tasks', 'timesheets'],
      permissions: [
        { action: 'view', resource: 'tasks', scope: 'own' },
        { action: 'edit', resource: 'tasks', scope: 'own' },
        { action: 'create', resource: 'timesheets', scope: 'own' },
      ]
    }
  ]
};

const mockSuperAdmin: User = {
  id: 'usr_999',
  name: 'System Admin',
  email: 'admin@company.com',
  globalRole: 'SUPER_ADMIN',
  activeModule: 'sales',
  activeTeam: {
    teamId: 'team_001',
    teamName: 'Enterprise Sales',
    isPrimary: true,
    departmentId: 'dept_001',
    departmentName: 'Sales'
  },
  activeDepartment: 'dept_001',
  accessibleModules: [] // Super admin bypasses this in UI logic
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setActiveModule: (moduleId: string) => void;
  setActiveTeam: (teamId: string) => void;
  // Auth flows
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  // For dev testing only
  switchUser: (role: 'admin' | 'employee' | 'superadmin') => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: mockSuperAdmin, // Defaulting to super admin so you can see all modules and pages
  isLoading: false,
  error: null,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/auth/profile');
      set({ user: response.data, isLoading: false });
    } catch (err: any) {
      // Fallback to mock data for now during transition if API fails
      console.warn('API fetch failed, using mock data:', err);
      set({ user: mockModuleAdmin, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null });
      window.location.href = '/login';
    }
  },

  setActiveModule: (moduleId) => set((state) => ({ 
    user: state.user ? { ...state.user, activeModule: moduleId } : null 
  })),

  setActiveTeam: (teamId) => set((state) => {
    if (!state.user) return state;
    const isMockSecondary = teamId === 'team_002';
    return {
      user: {
        ...state.user,
        activeTeam: {
          teamId,
          teamName: isMockSecondary ? 'SMB Sales' : 'Enterprise Sales',
          isPrimary: !isMockSecondary,
          departmentId: 'dept_001',
          departmentName: 'Sales'
        }
      }
    };
  }),

  switchUser: (role) => set({ 
    user: role === 'superadmin' ? mockSuperAdmin : (role === 'admin' ? mockModuleAdmin : mockUser) 
  })
}));
