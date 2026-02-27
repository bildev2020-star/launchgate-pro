import type { Task } from '@/types/project';
import { StatusBadge } from './StatusBadge';
import { Link2, Calendar, User, AlertTriangle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityColor = task.priority === 'High' ? 'border-l-blocked' : task.priority === 'Med' ? 'border-l-warning' : 'border-l-border';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left glass-card rounded-lg p-4 border-l-4 ${priorityColor} hover:shadow-md transition-all group animate-slide-in`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium leading-tight group-hover:text-accent transition-colors">
          {task.title}
        </h4>
        <StatusBadge status={task.statut} />
      </div>

      {task.blocking_reason && (
        <div className="flex items-center gap-1.5 text-xs text-blocked mb-2">
          <AlertTriangle className="h-3 w-3" />
          <span className="truncate">{task.blocking_reason}</span>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
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
            {task.dependency_task_ids.length} dép.
          </span>
        )}
      </div>
    </button>
  );
}
