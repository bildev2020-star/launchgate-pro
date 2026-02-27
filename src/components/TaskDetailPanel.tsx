import { useState } from 'react';
import type { Task, GlobalStatus } from '@/types/project';
import { StatusBadge } from './StatusBadge';
import { TASK_TRANSITIONS } from '@/lib/taskWorkflow';
import { mockTeamMembers, getMemberById, getMembersByRole, type TeamMember } from '@/data/teamMembers';
import { mockTasks } from '@/data/mockData';
import {
  X, Calendar, User, Link2, AlertTriangle, ChevronRight,
  Clock, FileText, Shield, ArrowRight, UserPlus, Check
} from 'lucide-react';

interface TaskDetailPanelProps {
  task: Task;
  allTasks: Task[];
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: GlobalStatus) => void;
  onAssigneeChange: (taskId: string, assigneeId: string | undefined) => void;
  onTaskClick: (taskId: string) => void;
}

const transitionButtonStyles: Record<string, string> = {
  default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
  destructive: 'bg-blocked text-blocked-foreground hover:bg-blocked/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
};

export function TaskDetailPanel({ task, allTasks, onClose, onStatusChange, onAssigneeChange, onTaskClick }: TaskDetailPanelProps) {
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const transitions = TASK_TRANSITIONS[task.statut] || [];
  const assignee = task.assignee ? getMemberById(task.assignee) : undefined;
  const suggestedMembers = getMembersByRole(task.owner_role);
  const depTasks = task.dependency_task_ids.map((id) => allTasks.find((t) => t.id === id)).filter(Boolean) as Task[];
  const blockedByThis = allTasks.filter((t) => t.dependency_task_ids.includes(task.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl bg-card border-l border-border shadow-2xl overflow-y-auto animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <span className="mono text-xs text-muted-foreground shrink-0">{task.id.toUpperCase()}</span>
              <StatusBadge status={task.statut} />
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-lg font-semibold mt-2">{task.title}</h2>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Status Transitions */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Transition de statut</h4>
            <div className="flex flex-wrap gap-2">
              {transitions.map((t) => (
                <button
                  key={t.to}
                  onClick={() => onStatusChange(task.id, t.to)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${transitionButtonStyles[t.variant]}`}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
              {transitions.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune transition disponible</p>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Affectation</h4>
            {assignee ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${assignee.avatar_color} flex items-center justify-center text-xs font-bold text-accent-foreground`}>
                    {assignee.avatar_initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{assignee.name}</p>
                    <p className="text-xs text-muted-foreground">{assignee.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                  className="text-xs text-accent hover:underline"
                >
                  Changer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors w-full"
              >
                <UserPlus className="h-4 w-4" />
                Affecter quelqu'un
              </button>
            )}

            {showAssigneePicker && (
              <div className="mt-3 border border-border rounded-lg overflow-hidden bg-card">
                <div className="px-3 py-2 bg-muted/50 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    Suggéré ({task.owner_role})
                  </p>
                </div>
                {suggestedMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onAssigneeChange(task.id, m.id); setShowAssigneePicker(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-full ${m.avatar_color} flex items-center justify-center text-[10px] font-bold text-accent-foreground`}>
                      {m.avatar_initials}
                    </div>
                    <div className="text-left">
                      <p className="text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                    {task.assignee === m.id && <Check className="h-4 w-4 text-success ml-auto" />}
                  </button>
                ))}
                <div className="px-3 py-2 bg-muted/50 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">Autres membres</p>
                </div>
                {mockTeamMembers.filter((m) => m.role !== task.owner_role).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onAssigneeChange(task.id, m.id); setShowAssigneePicker(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-full ${m.avatar_color} flex items-center justify-center text-[10px] font-bold text-accent-foreground`}>
                      {m.avatar_initials}
                    </div>
                    <div className="text-left">
                      <p className="text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                    {task.assignee === m.id && <Check className="h-4 w-4 text-success ml-auto" />}
                  </button>
                ))}
                {assignee && (
                  <button
                    onClick={() => { onAssigneeChange(task.id, undefined); setShowAssigneePicker(false); }}
                    className="w-full px-3 py-2.5 text-sm text-blocked hover:bg-muted/50 transition-colors border-t border-border text-left"
                  >
                    Retirer l'affectation
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Détails</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" />Rôle responsable</span>
                <span className="font-medium">{task.owner_role}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Priorité</span>
                <span className={`font-medium ${task.priority === 'High' ? 'text-blocked' : task.priority === 'Med' ? 'text-warning' : ''}`}>
                  {task.priority === 'High' ? 'Haute' : task.priority === 'Med' ? 'Moyenne' : 'Basse'}
                </span>
              </div>
              {task.due_date && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Échéance</span>
                  <span className="font-medium">{new Date(task.due_date).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Approbation</span>
                <span className="font-medium">{task.approval_required ? 'Requise' : 'Non requise'}</span>
              </div>
              {task.approval_required && task.approver_roles.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Approbateurs</span>
                  <span className="font-medium">{task.approver_roles.join(', ')}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Étape</span>
                <span className="font-medium">Étape {task.step_order}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Blocking reason */}
          {task.blocking_reason && (
            <div className="p-3 rounded-lg bg-blocked/10 border border-blocked/20">
              <div className="flex items-center gap-2 text-sm font-medium text-blocked mb-1">
                <AlertTriangle className="h-4 w-4" />
                Raison du blocage
              </div>
              <p className="text-sm">{task.blocking_reason}</p>
            </div>
          )}

          {/* Dependencies */}
          {depTasks.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                Dépend de ({depTasks.length})
              </h4>
              <div className="space-y-2">
                {depTasks.map((dep) => (
                  <button
                    key={dep.id}
                    onClick={() => onTaskClick(dep.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <span className="mono text-[10px] text-muted-foreground">{dep.id.toUpperCase()}</span>
                      <p className="text-sm font-medium truncate">{dep.title}</p>
                    </div>
                    <StatusBadge status={dep.statut} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Blocked by this */}
          {blockedByThis.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Bloque ({blockedByThis.length})
              </h4>
              <div className="space-y-2">
                {blockedByThis.map((dep) => (
                  <button
                    key={dep.id}
                    onClick={() => onTaskClick(dep.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <span className="mono text-[10px] text-muted-foreground">{dep.id.toUpperCase()}</span>
                      <p className="text-sm font-medium truncate">{dep.title}</p>
                    </div>
                    <StatusBadge status={dep.statut} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
            <p>Créé le {new Date(task.created_at).toLocaleDateString('fr-FR')}</p>
            <p>Mis à jour le {new Date(task.updated_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
