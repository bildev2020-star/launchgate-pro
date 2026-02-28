import type { Role, Priority } from './project';

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  owner_role: Role;
  dependency_task_ids: string[];
  approval_required: boolean;
  approver_roles: Role[];
  priority: Priority;
}

export interface GateCondition {
  /** Task template IDs that must be Done to unlock the next step */
  required_task_ids: string[];
}

export interface StepTemplate {
  id: string;
  name: string;
  order: number;
  tasks: TaskTemplate[];
  gate?: GateCondition;
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  steps: StepTemplate[];
}
