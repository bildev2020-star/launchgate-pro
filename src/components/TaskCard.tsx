import type { Task } from '@/types/project';
import { StatusBadge } from './StatusBadge';
import { Link2, Calendar, User, AlertTriangle } from 'lucide-react';
import { getMemberById } from '@/data/teamMembers';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityColor = task.priority === 'High' ? 'border-l-blocked' : task.priority === 'Med' ? 'border-l-warning' : 'border-l-border';
  const assignee = task.assignee ? getMemberById(task.assignee) : undefined;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass-card rounded-lg p-4 border-l-4 ${priorityColor} hover:shadow-md transition-all group animate-slide-in`}
    >
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex justify-end">
          <StatusBadge status={task.statut} />
        </div>
        <h4 className="text-sm font-medium leading-tight group-hover:text-accent transition-colors">
          {task.title}
        </h4>
      </div>

      {task.blocking_reason && (
        <div className="flex items-center gap-1.5 text-xs text-blocked mb-2">
          <AlertTriangle className="h-3 w-3" />
          <span className="truncate">{task.blocking_reason}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0 flex-1">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.owner_role}
          </span>
          {task.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {task.dependency_task_ids.length > 0 && (
            <span className="flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              {task.dependency_task_ids.length}
            </span>
          )}
        </div>
        {/* Assignee avatar */}
        {assignee ? (
          <div className={`w-6 h-6 rounded-full ${assignee.avatar_color} flex items-center justify-center text-[9px] font-bold text-accent-foreground shrink-0`} title={assignee.name}>
            {assignee.avatar_initials}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center shrink-0" title="Non affecté">
            <User className="h-3 w-3 text-muted-foreground/40" />
          </div>
        )}
      </div>
    </button>
  );
}
