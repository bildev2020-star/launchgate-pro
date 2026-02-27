import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { mockProjects, mockSteps, mockTasks, mockDocuments, mockBatches, mockAuditLog, mockApprovals } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { StepTimeline } from '@/components/StepTimeline';
import { TaskCard } from '@/components/TaskCard';
import { ArrowLeft, Calendar, MapPin, User, FileText, Package, History, LayoutGrid, Link2, Eye, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { GlobalStatus, Step } from '@/types/project';

const tabs = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutGrid },
  { id: 'steps', label: 'Étapes', icon: CheckCircle2 },
  { id: 'tasks', label: 'Tâches', icon: LayoutGrid },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'batches', label: 'Lots & Stabilité', icon: Package },
  { id: 'audit', label: 'Journal', icon: History },
] as const;

type TabId = typeof tabs[number]['id'];

const taskStatusColumns: { status: GlobalStatus; label: string }[] = [
  { status: 'Draft', label: 'Brouillon' },
  { status: 'InProgress', label: 'En cours' },
  { status: 'Blocked', label: 'Bloqué' },
  { status: 'InReview', label: 'En revue' },
  { status: 'Done', label: 'Terminé' },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stepFilter, setStepFilter] = useState<string>('all');

  const project = mockProjects.find((p) => p.id === id);
  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Projet introuvable</p>
        <Link to="/projects" className="text-accent underline text-sm mt-2 inline-block">Retour aux projets</Link>
      </div>
    );
  }

  const steps = mockSteps.filter((s) => s.project_id === id);
  const tasks = mockTasks.filter((t) => t.project_id === id);
  const documents = mockDocuments.filter((d) => d.project_id === id);
  const batches = mockBatches.filter((b) => b.project_id === id);
  const auditLog = mockAuditLog.filter((a) => a.project_id === id);

  const doneSteps = steps.filter((s) => s.statut === 'Done' || s.statut === 'Approved').length;
  const doneTasks = tasks.filter((t) => t.statut === 'Done' || t.statut === 'Approved').length;
  const blockedTasks = tasks.filter((t) => t.statut === 'Blocked').length;
  const progress = steps.length ? Math.round((doneSteps / steps.length) * 100) : 0;

  const filteredTasks = stepFilter === 'all' ? tasks : tasks.filter((t) => t.step_id === stepFilter);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="h-3 w-3" />
          Projets
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="mono text-xs text-muted-foreground">{project.code_projet}</span>
              <StatusBadge status={project.statut} />
            </div>
            <h1 className="text-2xl font-bold">{project.produit_nom}</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{project.site}</span>
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{project.owner_role}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />AMM: {new Date(project.target_AMM_submission_date).toLocaleDateString('fr-FR')}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />DE: {new Date(project.target_DE_date).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Progression</p>
              <p className="text-2xl font-bold mt-1">{progress}%</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Étapes</p>
              <p className="text-2xl font-bold mt-1">{doneSteps}/{steps.length}</p>
              <p className="text-xs text-success mt-1">terminées</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Tâches terminées</p>
              <p className="text-2xl font-bold mt-1">{doneTasks}/{tasks.length}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Bloquées</p>
              <p className="text-2xl font-bold mt-1 text-blocked">{blockedTasks}</p>
              {blockedTasks > 0 && <p className="text-xs text-blocked mt-1">Attention requise</p>}
            </div>
          </div>

          {/* Step Timeline */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-6">Pipeline de validation</h3>
            <StepTimeline steps={steps} />
          </div>

          {/* Recent activity */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Activité récente</h3>
            <div className="space-y-3">
              {auditLog.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">{entry.action}</p>
                    <p className="text-muted-foreground text-xs">{entry.details}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {new Date(entry.timestamp).toLocaleString('fr-FR')} — {entry.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'steps' && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <StepTimeline steps={steps} />
          </div>
          <div className="grid gap-4">
            {steps.map((step) => {
              const stepTasks = tasks.filter((t) => t.step_id === step.id);
              const stepDone = stepTasks.filter((t) => t.statut === 'Done' || t.statut === 'Approved').length;
              return (
                <div key={step.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {step.order}
                      </span>
                      <div>
                        <h4 className="font-medium">{step.name}</h4>
                        {step.start_date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(step.start_date).toLocaleDateString('fr-FR')}
                            {step.end_date ? ` → ${new Date(step.end_date).toLocaleDateString('fr-FR')}` : step.due_date ? ` → ${new Date(step.due_date).toLocaleDateString('fr-FR')} (prévu)` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={step.statut} />
                  </div>
                  {stepTasks.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{stepDone}/{stepTasks.length} tâches</span>
                        <span className="font-medium">{Math.round((stepDone / stepTasks.length) * 100)}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${(stepDone / stepTasks.length) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Step filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setStepFilter('all')}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                stepFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Toutes les étapes
            </button>
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setStepFilter(s.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  stepFilter === s.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.order}. {s.name.length > 20 ? s.name.substring(0, 20) + '…' : s.name}
              </button>
            ))}
          </div>

          {/* Kanban */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {taskStatusColumns.map((col) => {
              const colTasks = filteredTasks.filter((t) =>
                col.status === 'Done' ? (t.statut === 'Done' || t.statut === 'Approved') : t.statut === col.status
              );
              return (
                <div key={col.status} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{col.label}</h4>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                        Aucune tâche
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fichier</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Version</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 mono text-xs">{doc.version}</td>
                    <td className="px-4 py-3"><StatusBadge status={doc.statut} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {documents.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">Aucun document</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'batches' && (
        <div className="space-y-6">
          <h3 className="font-semibold">Lots de validation</h3>
          <div className="grid gap-4 lg:grid-cols-3">
            {batches.map((batch) => (
              <div key={batch.id} className="glass-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="mono text-sm font-semibold">{batch.batch_code}</span>
                  <StatusBadge status={batch.statut} />
                </div>
                <p className="text-xs text-muted-foreground">Type: {batch.type}</p>
              </div>
            ))}
          </div>
          {batches.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground glass-card rounded-xl">Aucun lot configuré</div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="glass-card rounded-xl p-6">
          <div className="space-y-4">
            {auditLog.map((entry, i) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-accent shrink-0" />
                  {i < auditLog.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-4 min-w-0">
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-sm text-muted-foreground">{entry.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleString('fr-FR')} — <span className="mono">{entry.actor}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
