import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Project, Step, Task } from '@/types/project';
import type { PipelineTemplate } from '@/types/pipelineTemplate';
import { supabase } from '@/integrations/supabase/client';

interface ProjectsContextValue {
  projects: Project[];
  steps: Step[];
  tasks: Task[];
  loading: boolean;
  computedSteps: (projectId: string) => Step[];
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'created_by'>, template: PipelineTemplate) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectFromTemplate: (projectId: string, template: PipelineTemplate) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateTaskInDb: (taskId: string, updates: Partial<Task>) => void;
  refreshData: () => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

let nextId = Date.now();
const genId = (prefix: string) => `${prefix}-${++nextId}`;

// DB → frontend mapping
function mapProjectFromDb(row: any): Project {
  return {
    id: row.id,
    code_projet: row.code_projet,
    produit_nom: row.produit_nom,
    produit_type: row.produit_type,
    site: row.site,
    statut: row.statut,
    owner_role: row.owner_role,
    created_by: row.created_by,
    created_at: row.created_at,
    target_DE_date: row.target_de_date ?? '',
    target_AMM_submission_date: row.target_amm_submission_date ?? '',
    description: row.description,
  };
}

function mapStepFromDb(row: any): Step {
  return {
    id: row.id,
    project_id: row.project_id,
    name: row.name,
    order: row.order,
    statut: row.statut,
    start_date: row.start_date ?? undefined,
    due_date: row.due_date ?? undefined,
    end_date: row.end_date ?? undefined,
  };
}

function mapTaskFromDb(row: any): Task {
  return {
    id: row.id,
    step_id: row.step_id,
    project_id: row.project_id,
    title: row.title,
    description: row.description,
    owner_role: row.owner_role,
    assignee: row.assignee ?? undefined,
    due_date: row.due_date ?? undefined,
    statut: row.statut,
    dependency_task_ids: row.dependency_task_ids ?? [],
    approval_required: row.approval_required,
    approver_roles: row.approver_roles ?? [],
    blocking_reason: row.blocking_reason ?? undefined,
    priority: row.priority,
    created_at: row.created_at,
    updated_at: row.updated_at,
    step_order: row.step_order,
  };
}

function generateStepsAndTasks(projectId: string, template: PipelineTemplate): { steps: Step[]; tasks: Task[] } {
  const steps: Step[] = [];
  const tasks: Task[] = [];
  const taskIdMap: Record<string, string> = {};

  for (const stepTpl of template.steps) {
    for (const taskTpl of stepTpl.tasks) {
      taskIdMap[taskTpl.id] = genId('t');
    }
  }

  for (const stepTpl of template.steps) {
    const stepId = genId('s');
    steps.push({
      id: stepId,
      project_id: projectId,
      name: stepTpl.name as any,
      order: stepTpl.order,
      statut: stepTpl.order === 1 ? 'Ready' : 'Draft',
    });

    for (const taskTpl of stepTpl.tasks) {
      const realTaskId = taskIdMap[taskTpl.id];
      tasks.push({
        id: realTaskId,
        step_id: stepId,
        project_id: projectId,
        title: taskTpl.title,
        description: taskTpl.description,
        owner_role: taskTpl.owner_role,
        statut: 'Draft',
        dependency_task_ids: taskTpl.dependency_task_ids.map(d => taskIdMap[d] || d),
        approval_required: taskTpl.approval_required,
        approver_roles: taskTpl.approver_roles,
        priority: taskTpl.priority,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
        step_order: stepTpl.order,
      });
    }
  }

  return { steps, tasks };
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [pRes, sRes, tRes] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('steps').select('*').order('order'),
      supabase.from('tasks').select('*'),
    ]);
    if (pRes.data) setProjects(pRes.data.map(mapProjectFromDb));
    if (sRes.data) setSteps(sRes.data.map(mapStepFromDb));
    if (tRes.data) setTasks(tRes.data.map(mapTaskFromDb));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addProject = useCallback(async (data: Omit<Project, 'id' | 'created_at' | 'created_by'>, template: PipelineTemplate) => {
    const id = genId('proj');
    const now = new Date().toISOString().split('T')[0];

    await supabase.from('projects').insert({
      id,
      code_projet: data.code_projet,
      produit_nom: data.produit_nom,
      produit_type: data.produit_type,
      site: data.site,
      statut: data.statut,
      owner_role: data.owner_role,
      created_by: 'admin@pharma.ma',
      created_at: now,
      target_de_date: data.target_DE_date || null,
      target_amm_submission_date: data.target_AMM_submission_date || null,
      description: data.description,
    } as any);

    const generated = generateStepsAndTasks(id, template);

    // Insert steps
    const dbSteps = generated.steps.map(s => ({
      id: s.id,
      project_id: s.project_id,
      name: s.name,
      order: s.order,
      statut: s.statut,
      start_date: s.start_date ?? null,
      due_date: s.due_date ?? null,
      end_date: s.end_date ?? null,
    }));
    await supabase.from('steps').insert(dbSteps as any);

    // Insert tasks
    const dbTasks = generated.tasks.map(t => ({
      id: t.id,
      step_id: t.step_id,
      project_id: t.project_id,
      title: t.title,
      description: t.description,
      owner_role: t.owner_role,
      statut: t.statut,
      dependency_task_ids: t.dependency_task_ids,
      approval_required: t.approval_required,
      approver_roles: t.approver_roles,
      priority: t.priority,
      created_at: t.created_at,
      updated_at: t.updated_at,
      step_order: t.step_order,
    }));
    await supabase.from('tasks').insert(dbTasks as any);

    // Refresh local state
    await fetchAll();
    return id;
  }, [fetchAll]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const dbUpdates: any = { ...updates };
    if ('target_DE_date' in updates) {
      dbUpdates.target_de_date = updates.target_DE_date || null;
      delete dbUpdates.target_DE_date;
    }
    if ('target_AMM_submission_date' in updates) {
      dbUpdates.target_amm_submission_date = updates.target_AMM_submission_date || null;
      delete dbUpdates.target_AMM_submission_date;
    }
    await supabase.from('projects').update(dbUpdates).eq('id', id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const updateTaskInDb = useCallback(async (taskId: string, updates: Partial<Task>) => {
    await supabase.from('tasks').update(updates as any).eq('id', taskId);
  }, []);

  const computedSteps = useCallback((projectId: string): Step[] => {
    const projectSteps = steps.filter(s => s.project_id === projectId).sort((a, b) => a.order - b.order);
    return projectSteps.map((step, i) => {
      const stepTasks = tasks.filter(t => t.step_id === step.id);
      if (stepTasks.length === 0) return step;
      const allDone = stepTasks.every(t => t.statut === 'Done' || t.statut === 'Approved');
      const anyInProgress = stepTasks.some(t => t.statut === 'InProgress' || t.statut === 'InReview' || t.statut === 'Rework');
      const anyBlocked = stepTasks.some(t => t.statut === 'Blocked');
      const prevStep = i > 0 ? projectSteps[i - 1] : null;
      const prevDone = !prevStep || tasks.filter(t => t.step_id === prevStep.id).every(t => t.statut === 'Done' || t.statut === 'Approved');

      let statut: Step['statut'] = step.statut;
      if (allDone) statut = 'Done';
      else if (anyBlocked) statut = 'Blocked';
      else if (anyInProgress) statut = 'InProgress';
      else if (prevDone && stepTasks.some(t => t.statut === 'Draft' || t.statut === 'Ready')) statut = 'Ready';
      else statut = 'Draft';
      return { ...step, statut };
    });
  }, [steps, tasks]);

  const updateProjectFromTemplate = useCallback(async (projectId: string, template: PipelineTemplate) => {
    await supabase.from('tasks').delete().eq('project_id', projectId);
    await supabase.from('steps').delete().eq('project_id', projectId);
    const generated = generateStepsAndTasks(projectId, template);
    const dbSteps = generated.steps.map(s => ({
      id: s.id, project_id: s.project_id, name: s.name, order: s.order, statut: s.statut,
      start_date: s.start_date ?? null, due_date: s.due_date ?? null, end_date: s.end_date ?? null,
    }));
    await supabase.from('steps').insert(dbSteps as any);
    const dbTasks = generated.tasks.map(t => ({
      id: t.id, step_id: t.step_id, project_id: t.project_id, title: t.title, description: t.description,
      owner_role: t.owner_role, statut: t.statut, dependency_task_ids: t.dependency_task_ids,
      approval_required: t.approval_required, approver_roles: t.approver_roles, priority: t.priority,
      created_at: t.created_at, updated_at: t.updated_at, step_order: t.step_order,
    }));
    await supabase.from('tasks').insert(dbTasks as any);
    await fetchAll();
  }, [fetchAll]);

  return (
    <ProjectsContext.Provider value={{
      projects, steps, tasks, loading, computedSteps,
      addProject, updateProject, updateProjectFromTemplate, setTasks,
      updateTaskInDb, refreshData: fetchAll,
    }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
}
