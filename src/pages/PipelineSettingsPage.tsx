import { useState } from 'react';
import { usePipelineTemplate } from '@/contexts/PipelineTemplateContext';
import type { TaskTemplate } from '@/types/pipelineTemplate';
import type { Role, Priority } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  ArrowRight, Link2, Shield, RotateCcw, Settings2,
} from 'lucide-react';

const ROLES: Role[] = ['Business Developer', 'Marketing', 'AR', 'Supply', 'QC', 'Bureau Méthodes', 'Validation', 'Ordonnancement', 'Production'];
const PRIORITIES: Priority[] = ['Low', 'Med', 'High'];

export default function PipelineSettingsPage() {
  const ctx = usePipelineTemplate();
  const { template } = ctx;
  const [expandedStep, setExpandedStep] = useState<string | null>(template.steps[0]?.id ?? null);
  const [addStepOpen, setAddStepOpen] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [addTaskOpen, setAddTaskOpen] = useState<string | null>(null);
  const [editTaskOpen, setEditTaskOpen] = useState<{ stepId: string; task: TaskTemplate } | null>(null);
  const [gateOpen, setGateOpen] = useState<string | null>(null);

  // New task form state
  const [newTask, setNewTask] = useState<Omit<TaskTemplate, 'id'>>({
    title: '', description: '', owner_role: 'Validation', dependency_task_ids: [],
    approval_required: false, approver_roles: [], priority: 'Med',
  });

  const handleAddStep = () => {
    if (!newStepName.trim()) return;
    ctx.addStep(newStepName.trim());
    setNewStepName('');
    setAddStepOpen(false);
    toast({ title: 'Étape ajoutée' });
  };

  const handleAddTask = (stepId: string) => {
    if (!newTask.title.trim()) return;
    ctx.addTask(stepId, newTask);
    setNewTask({ title: '', description: '', owner_role: 'Validation', dependency_task_ids: [], approval_required: false, approver_roles: [], priority: 'Med' });
    setAddTaskOpen(null);
    toast({ title: 'Tâche ajoutée' });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= template.steps.length) return;
    ctx.reorderSteps(index, target);
  };

  const findTaskLabel = (taskId: string) => {
    const found = ctx.allTasks.find(t => t.task.id === taskId);
    return found ? `${found.stepName} → ${found.task.title}` : taskId;
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            Paramétrage du Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les étapes, tâches, dépendances et gates du template de validation.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { ctx.resetToDefault(); toast({ title: 'Template réinitialisé' }); }}>
          <RotateCcw className="h-4 w-4 mr-1" /> Réinitialiser
        </Button>
      </div>

      <Separator />

      {/* Steps */}
      <div className="space-y-3">
        {template.steps.map((step, idx) => {
          const isExpanded = expandedStep === step.id;
          return (
            <Card key={step.id} className="overflow-hidden">
              {/* Step header */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-mono text-muted-foreground w-6">{step.order}</span>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <StepNameEditor step={step} onUpdate={(name) => ctx.updateStep(step.id, { name })} />
                <div className="flex items-center gap-1 ml-auto">
                  <Badge variant="secondary" className="text-xs">{step.tasks.length} tâches</Badge>
                  {step.gate && <Badge variant="outline" className="text-xs gap-1"><Shield className="h-3 w-3" /> Gate</Badge>}
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleMoveStep(idx, 'up'); }} disabled={idx === 0}>↑</Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); handleMoveStep(idx, 'down'); }} disabled={idx === template.steps.length - 1}>↓</Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); ctx.removeStep(step.id); toast({ title: 'Étape supprimée' }); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expanded: tasks */}
              {isExpanded && (
                <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
                  {/* Gate config */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setGateOpen(step.id)}>
                      <Shield className="h-3.5 w-3.5 mr-1" /> Configurer Gate
                    </Button>
                    {step.gate && step.gate.required_task_ids.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {step.gate.required_task_ids.length} tâche(s) requise(s) pour débloquer l'étape suivante
                      </span>
                    )}
                  </div>

                  {/* Task list */}
                  {step.tasks.length === 0 && (
                    <p className="text-sm text-muted-foreground italic py-2">Aucune tâche dans cette étape.</p>
                  )}
                  {step.tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-background border group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{task.title}</span>
                          <Badge variant="outline" className="text-xs">{task.owner_role}</Badge>
                          <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Med' ? 'default' : 'secondary'} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.approval_required && <Badge className="text-xs bg-in-review/15 text-in-review border-0">Approbation</Badge>}
                        </div>
                        {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                        {task.dependency_task_ids.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <Link2 className="h-3 w-3 text-muted-foreground" />
                            {task.dependency_task_ids.map(depId => (
                              <Badge key={depId} variant="secondary" className="text-xs">{findTaskLabel(depId)}</Badge>
                            ))}
                          </div>
                        )}
                        {task.approval_required && task.approver_roles.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <Shield className="h-3 w-3 text-muted-foreground" />
                            {task.approver_roles.map(r => (
                              <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditTaskOpen({ stepId: step.id, task })}>
                          <Settings2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => { ctx.removeTask(step.id, task.id); toast({ title: 'Tâche supprimée' }); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={() => setAddTaskOpen(step.id)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter une tâche
                  </Button>
                </div>
              )}
            </Card>
          );
        })}

        <Button variant="outline" onClick={() => setAddStepOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter une étape
        </Button>
      </div>

      {/* Add Step Dialog */}
      <Dialog open={addStepOpen} onOpenChange={setAddStepOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle étape</DialogTitle></DialogHeader>
          <Input placeholder="Nom de l'étape" value={newStepName} onChange={e => setNewStepName(e.target.value)} />
          <DialogFooter>
            <Button onClick={handleAddStep} disabled={!newStepName.trim()}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={!!addTaskOpen} onOpenChange={() => setAddTaskOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouvelle tâche</DialogTitle></DialogHeader>
          <TaskForm
            task={newTask}
            allTasks={ctx.allTasks}
            onChange={setNewTask}
            roles={ROLES}
          />
          <DialogFooter>
            <Button onClick={() => addTaskOpen && handleAddTask(addTaskOpen)} disabled={!newTask.title.trim()}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editTaskOpen} onOpenChange={() => setEditTaskOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Modifier la tâche</DialogTitle></DialogHeader>
          {editTaskOpen && (
            <TaskForm
              task={editTaskOpen.task}
              allTasks={ctx.allTasks.filter(t => t.task.id !== editTaskOpen.task.id)}
              onChange={(updates) => {
                ctx.updateTask(editTaskOpen.stepId, editTaskOpen.task.id, updates);
                setEditTaskOpen({ ...editTaskOpen, task: { ...editTaskOpen.task, ...updates } });
              }}
              roles={ROLES}
            />
          )}
          <DialogFooter>
            <Button onClick={() => { setEditTaskOpen(null); toast({ title: 'Tâche mise à jour' }); }}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gate Dialog */}
      <Dialog open={!!gateOpen} onOpenChange={() => setGateOpen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Configurer le Gate</DialogTitle></DialogHeader>
          {gateOpen && <GateEditor stepId={gateOpen} ctx={ctx} onClose={() => setGateOpen(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- Sub-components ----------

function StepNameEditor({ step, onUpdate }: { step: { id: string; name: string }; onUpdate: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(step.name);

  if (editing) {
    return (
      <Input
        className="h-7 text-sm w-64"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => { onUpdate(value); setEditing(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { onUpdate(value); setEditing(false); } }}
        autoFocus
        onClick={e => e.stopPropagation()}
      />
    );
  }
  return (
    <span className="text-sm font-semibold flex-1 truncate" onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}>
      {step.name}
    </span>
  );
}

function TaskForm({
  task,
  allTasks,
  onChange,
  roles,
}: {
  task: Omit<TaskTemplate, 'id'> & { id?: string };
  allTasks: { stepId: string; stepName: string; task: TaskTemplate }[];
  onChange: (updates: any) => void;
  roles: Role[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Titre</Label>
        <Input value={task.title} onChange={e => onChange({ ...task, title: e.target.value })} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={task.description} onChange={e => onChange({ ...task, description: e.target.value })} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Rôle propriétaire</Label>
          <Select value={task.owner_role} onValueChange={v => onChange({ ...task, owner_role: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priorité</Label>
          <Select value={task.priority} onValueChange={v => onChange({ ...task, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Basse</SelectItem>
              <SelectItem value="Med">Moyenne</SelectItem>
              <SelectItem value="High">Haute</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dependencies */}
      <div>
        <Label>Dépendances</Label>
        <div className="space-y-1 mt-1 max-h-40 overflow-y-auto border rounded-md p-2">
          {allTasks.map(({ stepName, task: t }) => (
            <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
              <Checkbox
                checked={task.dependency_task_ids.includes(t.id)}
                onCheckedChange={(checked) => {
                  const deps = checked
                    ? [...task.dependency_task_ids, t.id]
                    : task.dependency_task_ids.filter(d => d !== t.id);
                  onChange({ ...task, dependency_task_ids: deps });
                }}
              />
              <span className="text-muted-foreground text-xs">{stepName}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span>{t.title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Approval */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={task.approval_required}
            onCheckedChange={(checked) => onChange({ ...task, approval_required: !!checked })}
          />
          <span className="text-sm">Approbation requise</span>
        </label>
        {task.approval_required && (
          <div>
            <Label>Rôles approbateurs</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {roles.map(r => (
                <label key={r} className="flex items-center gap-1 text-xs cursor-pointer">
                  <Checkbox
                    checked={task.approver_roles.includes(r)}
                    onCheckedChange={(checked) => {
                      const arr = checked
                        ? [...task.approver_roles, r]
                        : task.approver_roles.filter(x => x !== r);
                      onChange({ ...task, approver_roles: arr });
                    }}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GateEditor({ stepId, ctx, onClose }: { stepId: string; ctx: ReturnType<typeof usePipelineTemplate>; onClose: () => void }) {
  const step = ctx.template.steps.find(s => s.id === stepId);
  if (!step) return null;

  const currentGateIds = step.gate?.required_task_ids ?? [];
  // All tasks from current step and previous steps
  const eligibleTasks = ctx.allTasks.filter(t => {
    const taskStep = ctx.template.steps.find(s => s.id === t.stepId);
    return taskStep && taskStep.order <= step.order;
  });

  const toggleTask = (taskId: string) => {
    const newIds = currentGateIds.includes(taskId)
      ? currentGateIds.filter(id => id !== taskId)
      : [...currentGateIds, taskId];
    ctx.updateGate(stepId, newIds.length > 0 ? { required_task_ids: newIds } : undefined);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Sélectionnez les tâches qui doivent être terminées (Done/Approved) pour débloquer l'étape suivante.
      </p>
      <div className="space-y-1 max-h-60 overflow-y-auto border rounded-md p-2">
        {eligibleTasks.map(({ stepName, task }) => (
          <label key={task.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
            <Checkbox
              checked={currentGateIds.includes(task.id)}
              onCheckedChange={() => toggleTask(task.id)}
            />
            <span className="text-muted-foreground text-xs">{stepName}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span>{task.title}</span>
          </label>
        ))}
      </div>
      <DialogFooter>
        <Button onClick={() => { onClose(); toast({ title: 'Gate mis à jour' }); }}>Fermer</Button>
      </DialogFooter>
    </div>
  );
}
