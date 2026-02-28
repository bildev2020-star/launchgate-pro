import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { PipelineTemplate, StepTemplate, TaskTemplate, GateCondition } from '@/types/pipelineTemplate';
import { DEFAULT_PIPELINE_TEMPLATE } from '@/data/defaultPipelineTemplate';

interface PipelineTemplateContextValue {
  template: PipelineTemplate;
  // Step operations
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
  // All task templates flat (for dependency picker)
  allTasks: { stepId: string; stepName: string; task: TaskTemplate }[];
}

const PipelineTemplateContext = createContext<PipelineTemplateContextValue | null>(null);

function loadTemplate(): PipelineTemplate {
  try {
    const stored = localStorage.getItem('pipeline-template');
    if (stored) return JSON.parse(stored);
  } catch {}
  return structuredClone(DEFAULT_PIPELINE_TEMPLATE);
}

function saveTemplate(t: PipelineTemplate) {
  localStorage.setItem('pipeline-template', JSON.stringify(t));
}

let nextId = Date.now();
const genId = (prefix: string) => `${prefix}-${++nextId}`;

export function PipelineTemplateProvider({ children }: { children: ReactNode }) {
  const [template, setTemplate] = useState<PipelineTemplate>(loadTemplate);

  const persist = useCallback((updater: (prev: PipelineTemplate) => PipelineTemplate) => {
    setTemplate(prev => {
      const next = updater(prev);
      saveTemplate(next);
      return next;
    });
  }, []);

  const addStep = useCallback((name: string) => {
    persist(t => ({
      ...t,
      steps: [...t.steps, { id: genId('st'), name, order: t.steps.length + 1, tasks: [] }],
    }));
  }, [persist]);

  const updateStep = useCallback((stepId: string, updates: Partial<Pick<StepTemplate, 'name'>>) => {
    persist(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? { ...s, ...updates } : s),
    }));
  }, [persist]);

  const removeStep = useCallback((stepId: string) => {
    persist(t => ({
      ...t,
      steps: t.steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i + 1 })),
    }));
  }, [persist]);

  const reorderSteps = useCallback((fromIndex: number, toIndex: number) => {
    persist(t => {
      const steps = [...t.steps];
      const [moved] = steps.splice(fromIndex, 1);
      steps.splice(toIndex, 0, moved);
      return { ...t, steps: steps.map((s, i) => ({ ...s, order: i + 1 })) };
    });
  }, [persist]);

  const addTask = useCallback((stepId: string, task: Omit<TaskTemplate, 'id'>) => {
    persist(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? { ...s, tasks: [...s.tasks, { ...task, id: genId('tt') }] } : s),
    }));
  }, [persist]);

  const updateTask = useCallback((stepId: string, taskId: string, updates: Partial<TaskTemplate>) => {
    persist(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? { ...s, tasks: s.tasks.map(tk => tk.id === taskId ? { ...tk, ...updates } : tk) } : s),
    }));
  }, [persist]);

  const removeTask = useCallback((stepId: string, taskId: string) => {
    persist(t => ({
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
  }, [persist]);

  const addDependency = useCallback((stepId: string, taskId: string, depId: string) => {
    persist(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? {
        ...s,
        tasks: s.tasks.map(tk => tk.id === taskId && !tk.dependency_task_ids.includes(depId)
          ? { ...tk, dependency_task_ids: [...tk.dependency_task_ids, depId] }
          : tk),
      } : s),
    }));
  }, [persist]);

  const removeDependency = useCallback((stepId: string, taskId: string, depId: string) => {
    persist(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? {
        ...s,
        tasks: s.tasks.map(tk => tk.id === taskId
          ? { ...tk, dependency_task_ids: tk.dependency_task_ids.filter(d => d !== depId) }
          : tk),
      } : s),
    }));
  }, [persist]);

  const updateGate = useCallback((stepId: string, gate: GateCondition | undefined) => {
    persist(t => ({
      ...t,
      steps: t.steps.map(s => s.id === stepId ? { ...s, gate } : s),
    }));
  }, [persist]);

  const resetToDefault = useCallback(() => {
    const fresh = structuredClone(DEFAULT_PIPELINE_TEMPLATE);
    saveTemplate(fresh);
    setTemplate(fresh);
  }, []);

  const allTasks = template.steps.flatMap(s =>
    s.tasks.map(task => ({ stepId: s.id, stepName: s.name, task }))
  );

  return (
    <PipelineTemplateContext.Provider value={{
      template, addStep, updateStep, removeStep, reorderSteps,
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
