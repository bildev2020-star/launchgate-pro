import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Project, Step, Task } from '@/types/project';
import type { PipelineTemplate } from '@/types/pipelineTemplate';
import { mockProjects, mockSteps, mockTasks, mockDocuments, mockBatches, mockAuditLog, mockApprovals, mockStabilityPoints } from '@/data/mockData';

interface ProjectsContextValue {
  projects: Project[];
  steps: Step[];
  tasks: Task[];
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'created_by'>, template: PipelineTemplate) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateProjectFromTemplate: (projectId: string, template: PipelineTemplate) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

let nextId = Date.now();
const genId = (prefix: string) => `${prefix}-${++nextId}`;

function generateStepsAndTasks(projectId: string, template: PipelineTemplate): { steps: Step[]; tasks: Task[] } {
  const steps: Step[] = [];
  const tasks: Task[] = [];
  // Map template task IDs to real task IDs
  const taskIdMap: Record<string, string> = {};

  // First pass: generate IDs
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
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [steps, setSteps] = useState<Step[]>(mockSteps);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const addProject = useCallback((data: Omit<Project, 'id' | 'created_at' | 'created_by'>, template: PipelineTemplate) => {
    const id = genId('proj');
    const project: Project = {
      ...data,
      id,
      created_at: new Date().toISOString().split('T')[0],
      created_by: 'admin@pharma.ma',
    };
    const generated = generateStepsAndTasks(id, template);
    setProjects(prev => [...prev, project]);
    setSteps(prev => [...prev, ...generated.steps]);
    setTasks(prev => [...prev, ...generated.tasks]);
    return id;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const updateProjectFromTemplate = useCallback((projectId: string, template: PipelineTemplate) => {
    // Remove old steps and tasks for this project, regenerate from template
    setSteps(prev => prev.filter(s => s.project_id !== projectId));
    setTasks(prev => prev.filter(t => t.project_id !== projectId));
    const generated = generateStepsAndTasks(projectId, template);
    setSteps(prev => [...prev, ...generated.steps]);
    setTasks(prev => [...prev, ...generated.tasks]);
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, steps, tasks, addProject, updateProject, updateProjectFromTemplate, setTasks }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
}
