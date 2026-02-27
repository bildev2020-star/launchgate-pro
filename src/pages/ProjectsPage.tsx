import { Link } from 'react-router-dom';
import { mockProjects, mockSteps } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import type { ProjectStatus } from '@/types/project';

const statusFilters: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Initié', value: 'Initiated' },
  { label: 'En cours', value: 'Running' },
  { label: 'Bloqué', value: 'Blocked' },
  { label: 'Prêt soumission', value: 'ReadyForSubmission' },
  { label: 'Soumis', value: 'Submitted' },
  { label: 'Clôturé', value: 'Closed' },
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = mockProjects.filter((p) => {
    if (filter !== 'all' && p.statut !== filter) return false;
    if (search && !p.produit_nom.toLowerCase().includes(search.toLowerCase()) && !p.code_projet.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground mt-1">Gérez vos projets de validation produit</p>
        </div>
        <button className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
          Nouveau projet
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filtered.map((project) => {
          const steps = mockSteps.filter((s) => s.project_id === project.id);
          const doneSteps = steps.filter((s) => s.statut === 'Done' || s.statut === 'Approved').length;
          const totalSteps = steps.length || 8;
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
                    <span className="status-pill bg-secondary text-secondary-foreground">{project.produit_type}</span>
                  </div>
                  <h3 className="font-semibold group-hover:text-accent transition-colors">{project.produit_nom}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-xs text-muted-foreground">{project.site}</p>
                  <p className="text-xs text-muted-foreground">
                    AMM: {new Date(project.target_AMM_submission_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    DE: {new Date(project.target_DE_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Étapes {doneSteps}/{totalSteps}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">Aucun projet trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
