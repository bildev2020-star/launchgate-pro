import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { Role } from '@/types/project';
import { mockTeamMembers, type TeamMember } from '@/data/teamMembers';

export interface RoleConfig {
  id: string;
  name: Role;
  description: string;
  color: string; // HSL-based tailwind token
}

const DEFAULT_ROLES: RoleConfig[] = [
  { id: 'r-01', name: 'Business Developer', description: 'Développement commercial et prospection', color: 'bg-chart-1' },
  { id: 'r-02', name: 'Marketing', description: 'Stratégie marketing et communication', color: 'bg-chart-2' },
  { id: 'r-03', name: 'AR', description: 'Affaires réglementaires', color: 'bg-chart-3' },
  { id: 'r-04', name: 'Supply', description: 'Approvisionnement et logistique', color: 'bg-chart-4' },
  { id: 'r-05', name: 'QC', description: 'Contrôle qualité', color: 'bg-chart-5' },
  { id: 'r-06', name: 'Bureau Méthodes', description: 'Industrialisation et méthodes', color: 'bg-chart-1' },
  { id: 'r-07', name: 'Validation', description: 'Validation des processus et équipements', color: 'bg-chart-2' },
  { id: 'r-08', name: 'Ordonnancement', description: 'Planification de la production', color: 'bg-chart-3' },
  { id: 'r-09', name: 'Production', description: 'Fabrication et conditionnement', color: 'bg-chart-4' },
];

interface RoleAssignment {
  roleId: string;
  memberId: string;
}

interface RolesContextValue {
  roles: RoleConfig[];
  assignments: RoleAssignment[];
  members: TeamMember[];
  addRole: (name: string, description: string) => void;
  updateRole: (id: string, updates: Partial<Pick<RoleConfig, 'name' | 'description' | 'color'>>) => void;
  deleteRole: (id: string) => void;
  assignMember: (roleId: string, memberId: string) => void;
  unassignMember: (roleId: string, memberId: string) => void;
  getMembersForRole: (roleId: string) => TeamMember[];
  getRolesForMember: (memberId: string) => RoleConfig[];
}

const RolesContext = createContext<RolesContextValue | null>(null);

const STORAGE_KEY = 'roles-config';
const ASSIGNMENTS_KEY = 'roles-assignments';

function loadRoles(): RoleConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return structuredClone(DEFAULT_ROLES);
}

function loadAssignments(): RoleAssignment[] {
  try {
    const stored = localStorage.getItem(ASSIGNMENTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // Default: assign members to their matching role
  const roles = loadRoles();
  return mockTeamMembers.map(m => {
    const role = roles.find(r => r.name === m.role);
    return role ? { roleId: role.id, memberId: m.id } : null;
  }).filter(Boolean) as RoleAssignment[];
}

let nextId = Date.now();
const genId = () => `r-${++nextId}`;

const ROLE_COLORS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];

export function RolesProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<RoleConfig[]>(loadRoles);
  const [assignments, setAssignments] = useState<RoleAssignment[]>(loadAssignments);

  const persist = useCallback((r: RoleConfig[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  }, []);
  const persistAssignments = useCallback((a: RoleAssignment[]) => {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(a));
  }, []);

  const addRole = useCallback((name: string, description: string) => {
    setRoles(prev => {
      const next = [...prev, { id: genId(), name: name as Role, description, color: ROLE_COLORS[prev.length % ROLE_COLORS.length] }];
      persist(next);
      return next;
    });
  }, [persist]);

  const updateRole = useCallback((id: string, updates: Partial<Pick<RoleConfig, 'name' | 'description' | 'color'>>) => {
    setRoles(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      persist(next);
      return next;
    });
  }, [persist]);

  const deleteRole = useCallback((id: string) => {
    setRoles(prev => {
      const next = prev.filter(r => r.id !== id);
      persist(next);
      return next;
    });
    setAssignments(prev => {
      const next = prev.filter(a => a.roleId !== id);
      persistAssignments(next);
      return next;
    });
  }, [persist, persistAssignments]);

  const assignMember = useCallback((roleId: string, memberId: string) => {
    setAssignments(prev => {
      if (prev.some(a => a.roleId === roleId && a.memberId === memberId)) return prev;
      const next = [...prev, { roleId, memberId }];
      persistAssignments(next);
      return next;
    });
  }, [persistAssignments]);

  const unassignMember = useCallback((roleId: string, memberId: string) => {
    setAssignments(prev => {
      const next = prev.filter(a => !(a.roleId === roleId && a.memberId === memberId));
      persistAssignments(next);
      return next;
    });
  }, [persistAssignments]);

  const members = mockTeamMembers;

  const getMembersForRole = useCallback((roleId: string) => {
    const memberIds = assignments.filter(a => a.roleId === roleId).map(a => a.memberId);
    return members.filter(m => memberIds.includes(m.id));
  }, [assignments, members]);

  const getRolesForMember = useCallback((memberId: string) => {
    const roleIds = assignments.filter(a => a.memberId === memberId).map(a => a.roleId);
    return roles.filter(r => roleIds.includes(r.id));
  }, [assignments, roles]);

  const value = useMemo(() => ({
    roles, assignments, members,
    addRole, updateRole, deleteRole,
    assignMember, unassignMember,
    getMembersForRole, getRolesForMember,
  }), [roles, assignments, members, addRole, updateRole, deleteRole, assignMember, unassignMember, getMembersForRole, getRolesForMember]);

  return (
    <RolesContext.Provider value={value}>
      {children}
    </RolesContext.Provider>
  );
}

export function useRoles() {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error('useRoles must be used within RolesProvider');
  return ctx;
}
