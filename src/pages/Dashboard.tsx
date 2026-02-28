import { Link } from 'react-router-dom';
import { useProjects } from '@/contexts/ProjectsContext';
import { StatusBadge } from '@/components/StatusBadge';
import {
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ListTodo,
} from 'lucide-react';

export default function Dashboard() {
  const { projects, steps: allSteps, tasks } = useProjects();

  const stats = [
    {
      label: 'Projets actifs',
      value: projects.filter((p) => p.statut === 'Running' || p.statut === 'Initiated').length,
      icon: FolderKanban,
      color: 'text-in-progress',
      bg: 'bg-in-progress/10',
    },
    {
      label: 'Tâches en cours',
      value: tasks.filter((t) => t.statut === 'InProgress').length,
      icon: ListTodo,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Tâches bloquées',
      value: tasks.filter((t) => t.statut === 'Blocked').length,
      icon: AlertTriangle,
      color: 'text-blocked',
      bg: 'bg-blocked/10',
    },
    {
      label: 'Tâches terminées',
      value: tasks.filter((t) => t.statut === 'Done' || t.statut === 'Approved').length,
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de vos projets de validation produit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Projets récents</h2>
          <Link
            to="/projects"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4">
          {projects.map((project) => {
            const steps = allSteps.filter((s) => s.project_id === project.id);
            const doneSteps = steps.filter((s) => s.statut === 'Done' || s.statut === 'Approved').length;
            const totalSteps = steps.length || 1;
            const progress = Math.round((doneSteps / totalSteps) * 100);

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="glass-card rounded-xl p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="mono text-xs text-muted-foreground">{project.code_projet}</span>
                      <StatusBadge status={project.statut} />
                    </div>
                    <h3 className="font-semibold group-hover:text-accent transition-colors">
                      {project.produit_nom}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{project.site}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Soumission: {new Date(project.target_AMM_submission_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
