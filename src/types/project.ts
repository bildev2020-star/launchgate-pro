export type ProductType = 'pharma' | 'cosmetique' | 'DM' | 'autre';

export type Role =
  | 'Business Developer'
  | 'Marketing'
  | 'AR'
  | 'Supply'
  | 'QC'
  | 'Bureau Méthodes'
  | 'Validation'
  | 'Ordonnancement'
  | 'Production';

export type GlobalStatus =
  | 'Draft'
  | 'Ready'
  | 'InProgress'
  | 'Blocked'
  | 'InReview'
  | 'Approved'
  | 'Done'
  | 'Rework'
  | 'Cancelled';

export type ProjectStatus =
  | 'Initiated'
  | 'Running'
  | 'Blocked'
  | 'ReadyForSubmission'
  | 'Submitted'
  | 'Closed';

export type StepName =
  | 'Préparation technique & réglementaire'
  | 'Commande & approvisionnement des intrants'
  | 'Change control'
  | 'Planification industrielle'
  | 'Validation & stabilité'
  | 'Préparation de la documentation'
  | 'Enregistrement'
  | 'Clôture';

export type DocumentType =
  | 'fiche_technique'
  | 'dossier_pre_soumission'
  | 'BAT'
  | 'programme_importation'
  | 'commande_intrants'
  | 'reception_liberation'
  | 'change_control'
  | 'doc_validation'
  | 'planning_lots'
  | 'dossier_lot'
  | 'rapport_QC'
  | 'rapport_stabilite'
  | 'modules_qualite_AMM'
  | 'DE'
  | 'autres';

export type DocumentStatus = 'Draft' | 'InReview' | 'Approved' | 'Rejected';
export type ApprovalDecision = 'Pending' | 'Approved' | 'Rejected';
export type BatchStatus = 'Planned' | 'Manufactured' | 'Packaged' | 'InStability' | 'Closed';
export type StabilityTimepoint = 'T0' | 'T3' | 'T6' | 'T9' | 'T12' | 'Custom';
export type Priority = 'Low' | 'Med' | 'High';

export interface Project {
  id: string;
  code_projet: string;
  produit_nom: string;
  produit_type: ProductType;
  site: string;
  statut: ProjectStatus;
  owner_role: Role;
  created_by: string;
  created_at: string;
  target_DE_date: string;
  target_AMM_submission_date: string;
  description: string;
}

export interface Step {
  id: string;
  project_id: string;
  name: StepName;
  order: number;
  statut: GlobalStatus;
  start_date?: string;
  due_date?: string;
  end_date?: string;
}

export interface Task {
  id: string;
  step_id: string;
  project_id: string;
  title: string;
  description: string;
  owner_role: Role;
  assignee?: string;
  due_date?: string;
  statut: GlobalStatus;
  dependency_task_ids: string[];
  approval_required: boolean;
  approver_roles: Role[];
  blocking_reason?: string;
  priority: Priority;
  created_at: string;
  updated_at: string;
  step_order: number;
}

export interface Document {
  id: string;
  project_id: string;
  step_id: string;
  task_id?: string;
  type: DocumentType;
  filename: string;
  version: string;
  statut: DocumentStatus;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Approval {
  id: string;
  object_type: 'Task' | 'Document' | 'Step' | 'Project';
  object_id: string;
  approver_role: Role;
  decision: ApprovalDecision;
  decided_at?: string;
  comment?: string;
}

export interface Batch {
  id: string;
  project_id: string;
  batch_code: string;
  type: 'Validation';
  statut: BatchStatus;
  manufactured_at?: string;
  packaged_at?: string;
  stability_started_at?: string;
}

export interface StabilityPoint {
  id: string;
  project_id: string;
  batch_id: string;
  timepoint: StabilityTimepoint;
  due_date: string;
  statut: GlobalStatus;
  result_document_id?: string;
}

export interface AuditEntry {
  id: string;
  project_id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}
