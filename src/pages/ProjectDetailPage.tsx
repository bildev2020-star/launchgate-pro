import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { useProjectDocuments, useProjectBatches, useProjectAuditLog } from '@/hooks/useProjectDetail';
import { StatusBadge } from '@/components/StatusBadge';
import { StepTimeline } from '@/components/StepTimeline';
import { TaskCard } from '@/components/TaskCard';
import { TaskDetailPanel } from '@/components/TaskDetailPanel';
import { ProjectFormDialog } from '@/components/ProjectFormDialog';
import { ArrowLeft, Calendar, MapPin, User, FileText, Package, History, LayoutGrid, CheckCircle2, Pencil, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import type { GlobalStatus } from '@/types/project';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const tabs = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutGrid },
  { id: 'steps', label: 'Étapes', icon: CheckCircle2 },
  { id: 'tasks', label: 'Tâches', icon: LayoutGrid },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'batches', label: 'Lots & Stabilité', icon: Package },
  { id: 'audit', label: 'Journal', icon: History },
] as const;

type TabId = (typeof tabs)[number]['id'];

const taskStatusColumns: { status: GlobalStatus; label: string }[] = [
  { status: 'Draft', label: 'Brouillon' },
  { status: 'InProgress', label: 'En cours' },
  { status: 'Blocked', label: 'Bloqué' },
  { status: 'InReview', label: 'En revue' },
  { status: 'Done', label: 'Terminé' },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks: allTasks, setTasks, computedSteps, updateTaskInDb } = useProjects();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [stepFilter, setStepFilter] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const project = projects.find((p) => p.id === id);
  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Projet introuvable</p>
        <Link to="/projects" className="text-accent underline text-sm mt-2 inline-block">Retour aux projets</Link>
      </div>
    );
  }

  const steps = computedSteps(id!);
  const projectTasks = allTasks.filter((t) => t.project_id === id);
  const documents = useProjectDocuments(id);
  const batches = useProjectBatches(id);
  const auditLog = useProjectAuditLog(id);

  const doneSteps = steps.filter((s) => s.statut === 'Done' || s.statut === 'Approved').length;
  const doneTasks = projectTasks.filter((t) => t.statut === 'Done' || t.statut === 'Approved').length;
  const blockedTasks = projectTasks.filter((t) => t.statut === 'Blocked').length;
  const progress = steps.length ? Math.round((doneSteps / steps.length) * 100) : 0;

  // Default to first step
  const activeStepId = stepFilter ?? (steps.length > 0 ? steps[0].id : undefined);
  const activeStepIndex = steps.findIndex((s) => s.id === activeStepId);
  const activeStep = activeStepIndex >= 0 ? steps[activeStepIndex] : undefined;

  const filteredTasks = activeStepId ? projectTasks.filter((t) => t.step_id === activeStepId) : projectTasks;
  const currentStepAllDone = filteredTasks.length > 0 && filteredTasks.every((t) => t.statut === 'Done' || t.statut === 'Approved');
  const canGoNext = currentStepAllDone && activeStepIndex < steps.length - 1;
  const canGoPrev = activeStepIndex > 0;

  const selectedTask = selectedTaskId ? projectTasks.find((t) => t.id === selectedTaskId) : undefined;

  const handleStatusChange = (taskId: string, newStatus: GlobalStatus) => {
    const updated_at = new Date().toISOString().split('T')[0];
    const updates: any = { statut: newStatus, updated_at, blocking_reason: newStatus !== 'Blocked' ? null : undefined };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, statut: newStatus, updated_at, blocking_reason: newStatus !== 'Blocked' ? undefined : t.blocking_reason }
          : t
      )
    );
    updateTaskInDb(taskId, updates);
    toast.success(`Statut mis à jour → ${newStatus}`);
  };

  const handleAssigneeChange = (taskId: string, assigneeId: string | undefined) => {
    const updated_at = new Date().toISOString().split('T')[0];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, assignee: assigneeId, updated_at } : t
      )
    );
    updateTaskInDb(taskId, { assignee: assigneeId ?? null, updated_at } as any);
    toast.success(assigneeId ? 'Tâche affectée' : 'Affectation retirée');
  };

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
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{project.site}</span>
          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{project.owner_role}</span>
          {project.target_AMM_submission_date && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />AMM: {new Date(project.target_AMM_submission_date).toLocaleDateString('fr-FR')}</span>}
          {project.target_DE_date && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />DE: {new Date(project.target_DE_date).toLocaleDateString('fr-FR')}</span>}
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
                activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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
              <p className="text-2xl font-bold mt-1">{doneTasks}/{projectTasks.length}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Bloquées</p>
              <p className="text-2xl font-bold mt-1 text-blocked">{blockedTasks}</p>
              {blockedTasks > 0 && <p className="text-xs text-blocked mt-1">Attention requise</p>}
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-6">Pipeline de validation</h3>
            <StepTimeline steps={steps} />
          </div>
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

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <StepTimeline steps={steps} />
          </div>
          <div className="grid gap-4">
            {steps.map((step) => {
              const stepTasks = projectTasks.filter((t) => t.step_id === step.id);
              const stepDone = stepTasks.filter((t) => t.statut === 'Done' || t.statut === 'Approved').length;
              return (
                <div key={step.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">{step.order}</span>
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

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Step selector with prev/next */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => canGoPrev && setStepFilter(steps[activeStepIndex - 1].id)}
              disabled={!canGoPrev}
              className={`p-2 rounded-lg border border-border transition-colors ${canGoPrev ? 'hover:bg-muted text-foreground' : 'opacity-30 cursor-not-allowed text-muted-foreground'}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-1.5 overflow-x-auto flex-1 pb-1">
              {steps.map((s, i) => {
                const sTasks = projectTasks.filter((t) => t.step_id === s.id);
                const sAllDone = sTasks.length > 0 && sTasks.every((t) => t.statut === 'Done' || t.statut === 'Approved');
                // A step is accessible if it's the first, or the previous step is fully done
                const prevDone = i === 0 || (() => {
                  const prevTasks = projectTasks.filter((t) => t.step_id === steps[i - 1].id);
                  return prevTasks.length > 0 && prevTasks.every((t) => t.statut === 'Done' || t.statut === 'Approved');
                })();
                const isActive = s.id === activeStepId;
                const locked = !prevDone && i > 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => !locked && setStepFilter(s.id)}
                    disabled={locked}
                    className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      locked
                        ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                        : isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {locked && <Lock className="h-3 w-3" />}
                    {sAllDone && <CheckCircle2 className="h-3 w-3 text-success" />}
                    {s.order}. {s.name.length > 20 ? s.name.substring(0, 20) + '…' : s.name}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => canGoNext && setStepFilter(steps[activeStepIndex + 1].id)}
              disabled={!canGoNext}
              className={`p-2 rounded-lg border border-border transition-colors ${canGoNext ? 'hover:bg-muted text-foreground' : 'opacity-30 cursor-not-allowed text-muted-foreground'}`}
              title={!currentStepAllDone ? 'Toutes les tâches doivent être terminées' : ''}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {!currentStepAllDone && activeStep && (
            <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              Terminez toutes les tâches de l'étape « {activeStep.name} » pour débloquer l'étape suivante.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {taskStatusColumns.map((col) => {
              const colTasks = filteredTasks.filter((t) =>
                col.status === 'Done' ? t.statut === 'Done' || t.statut === 'Approved' : t.statut === col.status
              );
              return (
                <div key={col.status} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{col.label}</h4>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{colTasks.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colTasks.map((task) => (
                      <TaskCard key={task.id} task={task} onClick={() => setSelectedTaskId(task.id)} />
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

      {/* Documents Tab */}
      {activeTab === 'documents' && (
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
          {documents.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">Aucun document</div>}
        </div>
      )}

      {/* Batches Tab */}
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
          {batches.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground glass-card rounded-xl">Aucun lot configuré</div>}
        </div>
      )}

      {/* Audit Tab */}
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

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          allTasks={projectTasks}
          onClose={() => setSelectedTaskId(null)}
          onStatusChange={handleStatusChange}
          onAssigneeChange={handleAssigneeChange}
          onTaskClick={(taskId) => setSelectedTaskId(taskId)}
        />
      )}

      {/* Edit Project Dialog */}
      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />
    </div>
  );
}
