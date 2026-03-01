import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import type { PipelineTemplate, StepTemplate, TaskTemplate, GateCondition } from '@/types/pipelineTemplate';
import { DEFAULT_PIPELINE_TEMPLATE } from '@/data/defaultPipelineTemplate';

interface PipelineTemplateContextValue {
  // Multi-template management
  templates: PipelineTemplate[];
  activeTemplateId: string;
  activeTemplate: PipelineTemplate;
  setActiveTemplateId: (id: string) => void;
  createTemplate: (name: string, description: string) => string;
  duplicateTemplate: (templateId: string) => string;
  deleteTemplate: (templateId: string) => void;
  updateTemplateMeta: (templateId: string, updates: Partial<Pick<PipelineTemplate, 'name' | 'description'>>) => void;
  // Step operations (on active template)
  addStep: (name: string) => void;
  updateStep: (stepId: string, updates: Partial<Pick<StepTemplate, 'name'>>) => void;
  removeStep: (stepId: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  // Task operations
  addTask: (stepId: string, task: Omit<TaskTemplate, 'id'>) => void;
  updateTask: (stepId: string, taskId: string, updates: Partial<TaskTemplate>) => void;
  removeTask: (stepId: string, taskId: string) => void;
  // Dependency operations
  addDependency: (stepId: string, taskId: string, dependencyTaskId: string) => void;
  removeDependency: (stepId: string, taskId: string, dependencyTaskId: string) => void;
  // Gate operations
  updateGate: (stepId: string, gate: GateCondition | undefined) => void;
  // Reset
  resetToDefault: () => void;
  // Computed: all task templates flat (for dependency picker), scoped to active template
  allTasks: { stepId: string; stepName: string; task: TaskTemplate }[];
  // Alias for backward compat
  template: PipelineTemplate;
}

const PipelineTemplateContext = createContext<PipelineTemplateContextValue | null>(null);

const STORAGE_KEY = 'pipeline-templates';
const ACTIVE_KEY = 'pipeline-active-template';

function loadTemplates(): PipelineTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // Migrate from old single-template storage
  try {
    const old = localStorage.getItem('pipeline-template');
    if (old) {
      const parsed = JSON.parse(old);
      if (parsed && parsed.id) return [parsed];
    }
  } catch {}
  return [structuredClone(DEFAULT_PIPELINE_TEMPLATE)];
}

function loadActiveId(templates: PipelineTemplate[]): string {
  try {
    const stored = localStorage.getItem(ACTIVE_KEY);
    if (stored && templates.some(t => t.id === stored)) return stored;
  } catch {}
  return templates[0].id;
}

function saveTemplates(t: PipelineTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}
function saveActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

let nextId = Date.now();
const genId = (prefix: string) => `${prefix}-${++nextId}`;

export function PipelineTemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<PipelineTemplate[]>(loadTemplates);
  const [activeTemplateId, setActiveTemplateIdState] = useState<string>(() => loadActiveId(templates));

  const activeTemplate = useMemo(
    () => templates.find(t => t.id === activeTemplateId) ?? templates[0],
    [templates, activeTemplateId],
  );

  const persistTemplates = useCallback((updater: (prev: PipelineTemplate[]) => PipelineTemplate[]) => {
    setTemplates(prev => {
      const next = updater(prev);
      saveTemplates(next);
      return next;
    });
  }, []);

  const persistActive = useCallback((updater: (prev: PipelineTemplate) => PipelineTemplate) => {
    persistTemplates(all => all.map(t => t.id === activeTemplateId ? updater(t) : t));
  }, [persistTemplates, activeTemplateId]);

  const setActiveTemplateId = useCallback((id: string) => {
    setActiveTemplateIdState(id);
    saveActiveId(id);
  }, []);

  // --- Multi-template CRUD ---
  const createTemplate = useCallback((name: string, description: string) => {
    const id = genId('tpl');
    const tpl: PipelineTemplate = { id, name, description, steps: [] };
    persistTemplates(prev => [...prev, tpl]);
    setActiveTemplateId(id);
    return id;
  }, [persistTemplates, setActiveTemplateId]);

  const duplicateTemplate = useCallback((templateId: string) => {
    const id = genId('tpl');
    persistTemplates(prev => {
      const source = prev.find(t => t.id === templateId);
      if (!source) return prev;
      const clone = structuredClone(source);
      clone.id = id;
      clone.name = `${clone.name} (copie)`;
      // Regen step/task IDs
      const taskIdMap: Record<string, string> = {};
      for (const step of clone.steps) {
        step.id = genId('st');
        for (const task of step.tasks) {
          const oldId = task.id;
          task.id = genId('tt');
          taskIdMap[oldId] = task.id;
        }
      }
      // Remap dependencies and gates
      for (const step of clone.steps) {
        for (const task of step.tasks) {
          task.dependency_task_ids = task.dependency_task_ids.map(d => taskIdMap[d] ?? d);
        }
        if (step.gate) {
          step.gate.required_task_ids = step.gate.required_task_ids.map(d => taskIdMap[d] ?? d);
        }
      }
      return [...prev, clone];
    });
    setActiveTemplateId(id);
    return id;
  }, [persistTemplates, setActiveTemplateId]);

  const deleteTemplate = useCallback((templateId: string) => {
    persistTemplates(prev => {
      if (prev.length <= 1) return prev; // Keep at least one
      const next = prev.filter(t => t.id !== templateId);
      if (activeTemplateId === templateId) {
        const newActiveId = next[0].id;
        setActiveTemplateId(newActiveId);
      }
      return next;
    });
  }, [persistTemplates, activeTemplateId, setActiveTemplateId]);

  const updateTemplateMeta = useCallback((templateId: string, updates: Partial<Pick<PipelineTemplate, 'name' | 'description'>>) => {
    persistTemplates(all => all.map(t => t.id === templateId ? { ...t, ...updates } : t));
  }, [persistTemplates]);

  // --- Step ops (on active) ---
  const addStep = useCallback((name: string) => {
    persistActive(t => ({ ...t, steps: [...t.steps, { id: genId('st'), name, order: t.steps.length + 1, tasks: [] }] }));
  }, [persistActive]);

  const updateStep = useCallback((stepId: string, updates: Partial<Pick<StepTemplate, 'name'>>) => {
    persistActive(t => ({ ...t, steps: t.steps.map(s => s.id === stepId ? { ...s, ...updates } : s) }));
  }, [persistActive]);

  const removeStep = useCallback((stepId: string) => {
    persistActive(t => ({ ...t, steps: t.steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i + 1 })) }));
  }, [persistActive]);

  const reorderSteps = useCallback((fromIndex: number, toIndex: number) => {
    persistActive(t => {
      const steps = [...t.steps];
      const [moved] = steps.splice(fromIndex, 1);
      steps.splice(toIndex, 0, moved);
      return { ...t, steps: steps.map((s, i) => ({ ...s, order: i + 1 })) };
    });
  }, [persistActive]);

  const addTask = useCallback((stepId: string, task: Omit<TaskTemplate, 'id'>) => {
    persistActive(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? { ...s, tasks: [...s.tasks, { ...task, id: genId('tt') }] } : s),
    }));
  }, [persistActive]);

  const updateTask = useCallback((stepId: string, taskId: string, updates: Partial<TaskTemplate>) => {
    persistActive(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? { ...s, tasks: s.tasks.map(tk => tk.id === taskId ? { ...tk, ...updates } : tk) } : s),
    }));
  }, [persistActive]);

  const removeTask = useCallback((stepId: string, taskId: string) => {
    persistActive(t => ({
      ...t,
      steps: t.steps.map(s => ({
        ...s,
        tasks: s.tasks.filter(tk => tk.id !== taskId).map(tk => ({
          ...tk,
          dependency_task_ids: tk.dependency_task_ids.filter(d => d !== taskId),
        })),
        gate: s.gate ? { required_task_ids: s.gate.required_task_ids.filter(id => id !== taskId) } : undefined,
      })),
    }));
  }, [persistActive]);

  const addDependency = useCallback((stepId: string, taskId: string, depId: string) => {
    persistActive(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? {
        ...s,
        tasks: s.tasks.map(tk => tk.id === taskId && !tk.dependency_task_ids.includes(depId)
          ? { ...tk, dependency_task_ids: [...tk.dependency_task_ids, depId] }
          : tk),
      } : s),
    }));
  }, [persistActive]);

  const removeDependency = useCallback((stepId: string, taskId: string, depId: string) => {
    persistActive(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? {
        ...s,
        tasks: s.tasks.map(tk => tk.id === taskId
          ? { ...tk, dependency_task_ids: tk.dependency_task_ids.filter(d => d !== depId) }
          : tk),
      } : s),
    }));
  }, [persistActive]);

  const updateGate = useCallback((stepId: string, gate: GateCondition | undefined) => {
    persistActive(t => ({ ...t, steps: t.steps.map(s => s.id === stepId ? { ...s, gate } : s) }));
  }, [persistActive]);

  const resetToDefault = useCallback(() => {
    const fresh = structuredClone(DEFAULT_PIPELINE_TEMPLATE);
    persistTemplates(prev => prev.map(t => t.id === activeTemplateId ? fresh : t));
  }, [persistTemplates, activeTemplateId]);

  const allTasks = useMemo(
    () => activeTemplate.steps.flatMap(s => s.tasks.map(task => ({ stepId: s.id, stepName: s.name, task }))),
    [activeTemplate],
  );

  return (
    <PipelineTemplateContext.Provider value={{
      templates, activeTemplateId, activeTemplate, setActiveTemplateId,
      createTemplate, duplicateTemplate, deleteTemplate, updateTemplateMeta,
      template: activeTemplate,
      addStep, updateStep, removeStep, reorderSteps,
      addTask, updateTask, removeTask,
      addDependency, removeDependency, updateGate,
      resetToDefault, allTasks,
    }}>
      {children}
    </PipelineTemplateContext.Provider>
  );
}

export function usePipelineTemplate() {
  const ctx = useContext(PipelineTemplateContext);
  if (!ctx) throw new Error('usePipelineTemplate must be used within PipelineTemplateProvider');
  return ctx;
}
