import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import type { Role } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

export interface RoleConfig {
  id: string;
  name: Role;
  description: string;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_initials: string;
  avatar_color: string;
}

interface RolesContextValue {
  roles: RoleConfig[];
  members: TeamMember[];
  loading: boolean;
  addRole: (name: string, description: string) => void;
  updateRole: (id: string, updates: Partial<Pick<RoleConfig, 'name' | 'description' | 'color'>>) => void;
  deleteRole: (id: string) => void;
  assignMember: (roleId: string, memberId: string) => void;
  unassignMember: (roleId: string, memberId: string) => void;
  getMembersForRole: (roleId: string) => TeamMember[];
  getRolesForMember: (memberId: string) => RoleConfig[];
}

const RolesContext = createContext<RolesContextValue | null>(null);

let nextId = Date.now();
const genId = () => `r-${++nextId}`;
const ROLE_COLORS = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];

export function RolesProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [rRes, mRes] = await Promise.all([
      supabase.from('role_configs').select('*'),
      supabase.from('team_members').select('*'),
    ]);
    if (rRes.data) setRoles(rRes.data.map((r: any) => ({ id: r.id, name: r.name as Role, description: r.description, color: r.color })));
    if (mRes.data) setMembers(mRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addRole = useCallback(async (name: string, description: string) => {
    const id = genId();
    const color = ROLE_COLORS[roles.length % ROLE_COLORS.length];
    await supabase.from('role_configs').insert({ id, name, description, color } as any);
    setRoles(prev => [...prev, { id, name: name as Role, description, color }]);
  }, [roles.length]);

  const updateRole = useCallback(async (id: string, updates: Partial<Pick<RoleConfig, 'name' | 'description' | 'color'>>) => {
    await supabase.from('role_configs').update(updates as any).eq('id', id);
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    await supabase.from('role_configs').delete().eq('id', id);
    setRoles(prev => prev.filter(r => r.id !== id));
  }, []);

  // For role assignment, we update the member's role field directly
  const assignMember = useCallback(async (roleId: string, memberId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    await supabase.from('team_members').update({ role: role.name } as any).eq('id', memberId);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: role.name } : m));
  }, [roles]);

  const unassignMember = useCallback(async (_roleId: string, memberId: string) => {
    await supabase.from('team_members').update({ role: '' } as any).eq('id', memberId);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: '' } : m));
  }, []);

  const getMembersForRole = useCallback((roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return [];
    return members.filter(m => m.role === role.name);
  }, [roles, members]);

  const getRolesForMember = useCallback((memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member || !member.role) return [];
    return roles.filter(r => r.name === member.role);
  }, [roles, members]);

  const value = useMemo(() => ({
    roles, members, loading,
    addRole, updateRole, deleteRole,
    assignMember, unassignMember,
    getMembersForRole, getRolesForMember,
  }), [roles, members, loading, addRole, updateRole, deleteRole, assignMember, unassignMember, getMembersForRole, getRolesForMember]);

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
