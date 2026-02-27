import type { Role } from '@/types/project';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar_initials: string;
  avatar_color: string;
}

export const mockTeamMembers: TeamMember[] = [
  { id: 'u-01', name: 'Karim Benali', email: 'k.benali@pharma.ma', role: 'Business Developer', avatar_initials: 'KB', avatar_color: 'bg-chart-1' },
  { id: 'u-02', name: 'Fatima Zahra', email: 'f.zahra@pharma.ma', role: 'Marketing', avatar_initials: 'FZ', avatar_color: 'bg-chart-2' },
  { id: 'u-03', name: 'Hassan Mourad', email: 'h.mourad@pharma.ma', role: 'AR', avatar_initials: 'HM', avatar_color: 'bg-chart-3' },
  { id: 'u-04', name: 'Samira El Idrissi', email: 's.elidrissi@pharma.ma', role: 'Supply', avatar_initials: 'SE', avatar_color: 'bg-chart-4' },
  { id: 'u-05', name: 'Omar Tazi', email: 'o.tazi@pharma.ma', role: 'QC', avatar_initials: 'OT', avatar_color: 'bg-chart-5' },
  { id: 'u-06', name: 'Nadia Amrani', email: 'n.amrani@pharma.ma', role: 'Bureau Méthodes', avatar_initials: 'NA', avatar_color: 'bg-chart-1' },
  { id: 'u-07', name: 'Youssef Berrada', email: 'y.berrada@pharma.ma', role: 'Validation', avatar_initials: 'YB', avatar_color: 'bg-chart-2' },
  { id: 'u-08', name: 'Leila Chaoui', email: 'l.chaoui@pharma.ma', role: 'Ordonnancement', avatar_initials: 'LC', avatar_color: 'bg-chart-3' },
  { id: 'u-09', name: 'Rachid Fassi', email: 'r.fassi@pharma.ma', role: 'Production', avatar_initials: 'RF', avatar_color: 'bg-chart-4' },
  { id: 'u-10', name: 'Amina Kettani', email: 'a.kettani@pharma.ma', role: 'QC', avatar_initials: 'AK', avatar_color: 'bg-chart-5' },
];

export function getMemberById(id: string): TeamMember | undefined {
  return mockTeamMembers.find((m) => m.id === id);
}

export function getMembersByRole(role: Role): TeamMember[] {
  return mockTeamMembers.filter((m) => m.role === role);
}
