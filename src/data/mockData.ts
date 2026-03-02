import type { Project, Step, Task, Document, Batch, StabilityPoint, AuditEntry, Approval } from '@/types/project';

export const STEP_NAMES = [
  'Préparation technique & réglementaire',
  'Commande & approvisionnement des intrants',
  'Change control',
  'Planification industrielle',
  'Validation & stabilité',
  'Préparation de la documentation',
  'Enregistrement',
  'Clôture',
] as const;

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    code_projet: 'VAL-2026-001',
    produit_nom: 'Amoxicilline 500mg',
    produit_type: 'pharma',
    site: 'M1',
    statut: 'Running',
    owner_role: 'Validation',
    created_by: 'admin@pharma.ma',
    created_at: '2026-01-15',
    target_DE_date: '2026-12-31',
    target_AMM_submission_date: '2026-09-15',
    description: 'Validation du procédé de fabrication Amoxicilline 500mg comprimés pelliculés pour le marché national.',
  },
  {
    id: 'proj-002',
    code_projet: 'VAL-2026-002',
    produit_nom: 'Crème Hydratante SPF30',
    produit_type: 'cosmetique',
    site: 'M2',
    statut: 'Initiated',
    owner_role: 'Validation',
    created_by: 'admin@pharma.ma',
    created_at: '2026-02-01',
    target_DE_date: '2027-03-30',
    target_AMM_submission_date: '2026-12-01',
    description: 'Nouveau produit cosmétique solaire avec validation packaging et stabilité.',
  },
  {
    id: 'proj-003',
    code_projet: 'VAL-2025-018',
    produit_nom: 'Paracétamol 1g',
    produit_type: 'pharma',
    site: 'M1',
    statut: 'ReadyForSubmission',
    owner_role: 'AR',
    created_by: 'admin@pharma.ma',
    created_at: '2025-06-10',
    target_DE_date: '2026-06-30',
    target_AMM_submission_date: '2026-03-01',
    description: 'Validation procédé Paracétamol 1g effervescent — dossier prêt pour soumission.',
  },
];

export const mockSteps: Step[] = [
  // proj-001
  { id: 's1-1', project_id: 'proj-001', name: 'Préparation technique & réglementaire', order: 1, statut: 'Done', start_date: '2026-01-15', end_date: '2026-02-10' },
  { id: 's1-2', project_id: 'proj-001', name: 'Commande & approvisionnement des intrants', order: 2, statut: 'Done', start_date: '2026-02-11', end_date: '2026-03-15' },
  { id: 's1-3', project_id: 'proj-001', name: 'Change control', order: 3, statut: 'InProgress', start_date: '2026-03-16', due_date: '2026-04-15' },
  { id: 's1-4', project_id: 'proj-001', name: 'Planification industrielle', order: 4, statut: 'Draft' },
  { id: 's1-5', project_id: 'proj-001', name: 'Validation & stabilité', order: 5, statut: 'Draft' },
  { id: 's1-6', project_id: 'proj-001', name: 'Préparation de la documentation', order: 6, statut: 'Draft' },
  { id: 's1-7', project_id: 'proj-001', name: 'Enregistrement', order: 7, statut: 'Draft' },
  { id: 's1-8', project_id: 'proj-001', name: 'Clôture', order: 8, statut: 'Draft' },
];

export const mockTasks: Task[] = [
  // Step 1 tasks
  { id: 't1.1', step_id: 's1-1', project_id: 'proj-001', title: 'Transmettre nom commercial', description: 'Communiquer le nom commercial définitif du produit.', owner_role: 'Business Developer', assignee: 'u-01', statut: 'Done', dependency_task_ids: [], approval_required: false, approver_roles: [], priority: 'High', created_at: '2026-01-15', updated_at: '2026-01-20', step_order: 1 },
  { id: 't1.2', step_id: 's1-1', project_id: 'proj-001', title: 'Transmettre caractéristiques techniques', description: 'Fournir les spécifications techniques du produit.', owner_role: 'Validation', assignee: 'u-07', statut: 'Done', dependency_task_ids: [], approval_required: false, approver_roles: [], priority: 'High', created_at: '2026-01-15', updated_at: '2026-01-22', step_order: 1 },
  { id: 't1.3', step_id: 's1-1', project_id: 'proj-001', title: 'Préparer dossier de pré-soumission', description: 'Compilation du dossier réglementaire de pré-soumission.', owner_role: 'AR', assignee: 'u-03', statut: 'Done', dependency_task_ids: ['t1.1', 't1.2'], approval_required: true, approver_roles: ['AR', 'Validation'], priority: 'High', created_at: '2026-01-20', updated_at: '2026-02-05', step_order: 1 },
  { id: 't1.4', step_id: 's1-1', project_id: 'proj-001', title: 'Préparer maquettes BAT', description: 'Création des maquettes Bon À Tirer.', owner_role: 'Marketing', assignee: 'u-02', statut: 'Done', dependency_task_ids: ['t1.1', 't1.2'], approval_required: true, approver_roles: ['Marketing', 'AR'], priority: 'Med', created_at: '2026-01-20', updated_at: '2026-02-08', step_order: 1 },
  { id: 't1.5', step_id: 's1-1', project_id: 'proj-001', title: "Préparer programme d'importation", description: "Élaboration du programme d'importation réglementaire.", owner_role: 'AR', assignee: 'u-03', statut: 'Done', dependency_task_ids: ['t1.3'], approval_required: false, approver_roles: [], priority: 'Med', created_at: '2026-02-01', updated_at: '2026-02-10', step_order: 1 },
  // Step 2 tasks
  { id: 't2.1', step_id: 's1-2', project_id: 'proj-001', title: 'Commander intrants production', description: 'Passer les commandes pour les intrants de production.', owner_role: 'Supply', assignee: 'u-04', statut: 'Done', dependency_task_ids: ['t1.2'], approval_required: false, approver_roles: [], priority: 'High', created_at: '2026-02-11', updated_at: '2026-02-15', step_order: 2 },
  { id: 't2.2', step_id: 's1-2', project_id: 'proj-001', title: 'Identifier intrants QC', description: 'Identifier les intrants nécessaires au contrôle qualité.', owner_role: 'QC', assignee: 'u-05', statut: 'Done', dependency_task_ids: ['t1.2'], approval_required: false, approver_roles: [], priority: 'Med', created_at: '2026-02-11', updated_at: '2026-02-14', step_order: 2 },
  { id: 't2.3', step_id: 's1-2', project_id: 'proj-001', title: 'Commander intrants QC', description: 'Commander les intrants QC identifiés.', owner_role: 'Supply', assignee: 'u-04', statut: 'Done', dependency_task_ids: ['t2.2'], approval_required: false, approver_roles: [], priority: 'Med', created_at: '2026-02-14', updated_at: '2026-02-18', step_order: 2 },
  { id: 't2.7', step_id: 's1-2', project_id: 'proj-001', title: 'Réception/contrôle/libération intrants', description: 'Réceptionner, contrôler et libérer les intrants.', owner_role: 'Supply', assignee: 'u-04', statut: 'Done', dependency_task_ids: ['t2.1', 't2.3'], approval_required: true, approver_roles: ['QC', 'Supply'], priority: 'High', created_at: '2026-02-20', updated_at: '2026-03-15', step_order: 2 },
  // Step 3 tasks
  { id: 't3.1', step_id: 's1-3', project_id: 'proj-001', title: 'Lancer change control eQMS', description: 'Initier le change control dans le système eQMS.', owner_role: 'Validation', assignee: 'u-07', statut: 'InProgress', dependency_task_ids: ['t2.7'], approval_required: false, approver_roles: [], priority: 'High', created_at: '2026-03-16', updated_at: '2026-03-20', step_order: 3 },
  { id: 't3.2', step_id: 's1-3', project_id: 'proj-001', title: 'Créer documentation de validation', description: 'Rédiger la documentation nécessaire à la validation.', owner_role: 'Validation', statut: 'Blocked', dependency_task_ids: ['t3.1'], approval_required: true, approver_roles: ['Validation', 'QC'], blocking_reason: 'En attente de finalisation du change control', priority: 'High', created_at: '2026-03-16', updated_at: '2026-03-20', step_order: 3 },
  // Step 4 tasks (future)
  { id: 't4.1', step_id: 's1-4', project_id: 'proj-001', title: 'Programmer réunion planification', description: 'Organiser la réunion de planification industrielle.', owner_role: 'Validation', statut: 'Draft', dependency_task_ids: ['t3.1'], approval_required: false, approver_roles: [], priority: 'Med', created_at: '2026-03-16', updated_at: '2026-03-16', step_order: 4 },
  { id: 't4.2', step_id: 's1-4', project_id: 'proj-001', title: 'Élaborer planning lots validation', description: 'Définir le planning de fabrication des lots de validation.', owner_role: 'Ordonnancement', statut: 'Draft', dependency_task_ids: ['t4.1'], approval_required: true, approver_roles: ['Validation', 'Production'], priority: 'High', created_at: '2026-03-16', updated_at: '2026-03-16', step_order: 4 },
];

export const mockDocuments: Document[] = [
  { id: 'doc-001', project_id: 'proj-001', step_id: 's1-1', task_id: 't1.3', type: 'dossier_pre_soumission', filename: 'dossier_pre_soumission_v2.pdf', version: '2.0', statut: 'Approved', uploaded_by: 'ar@pharma.ma', uploaded_at: '2026-02-05' },
  { id: 'doc-002', project_id: 'proj-001', step_id: 's1-1', task_id: 't1.4', type: 'BAT', filename: 'BAT_Amoxicilline_v1.pdf', version: '1.0', statut: 'Approved', uploaded_by: 'marketing@pharma.ma', uploaded_at: '2026-02-08' },
  { id: 'doc-003', project_id: 'proj-001', step_id: 's1-1', task_id: 't1.5', type: 'programme_importation', filename: 'programme_import_2026.xlsx', version: '1.0', statut: 'Approved', uploaded_by: 'ar@pharma.ma', uploaded_at: '2026-02-10' },
  { id: 'doc-004', project_id: 'proj-001', step_id: 's1-3', task_id: 't3.1', type: 'change_control', filename: 'CC-2026-015_draft.pdf', version: '0.1', statut: 'Draft', uploaded_by: 'validation@pharma.ma', uploaded_at: '2026-03-18' },
];

export const mockBatches: Batch[] = [
  { id: 'batch-001', project_id: 'proj-001', batch_code: 'LOT-VAL-001', type: 'Validation', statut: 'Planned' },
  { id: 'batch-002', project_id: 'proj-001', batch_code: 'LOT-VAL-002', type: 'Validation', statut: 'Planned' },
  { id: 'batch-003', project_id: 'proj-001', batch_code: 'LOT-VAL-003', type: 'Validation', statut: 'Planned' },
];

export const mockStabilityPoints: StabilityPoint[] = [];

export const mockApprovals: Approval[] = [
  { id: 'appr-001', object_type: 'Document', object_id: 'doc-001', approver_role: 'AR', decision: 'Approved', decided_at: '2026-02-04', comment: 'Conforme aux exigences réglementaires.' },
  { id: 'appr-002', object_type: 'Document', object_id: 'doc-001', approver_role: 'Validation', decision: 'Approved', decided_at: '2026-02-05' },
  { id: 'appr-003', object_type: 'Task', object_id: 't1.3', approver_role: 'AR', decision: 'Approved', decided_at: '2026-02-05' },
  { id: 'appr-004', object_type: 'Document', object_id: 'doc-002', approver_role: 'Marketing', decision: 'Approved', decided_at: '2026-02-07' },
  { id: 'appr-005', object_type: 'Document', object_id: 'doc-002', approver_role: 'AR', decision: 'Approved', decided_at: '2026-02-08' },
];

export const mockAuditLog: AuditEntry[] = [
  { id: 'al-001', project_id: 'proj-001', timestamp: '2026-01-15T09:00:00', action: 'Projet créé', actor: 'admin@pharma.ma', details: 'Projet VAL-2026-001 initialisé.' },
  { id: 'al-002', project_id: 'proj-001', timestamp: '2026-01-20T10:30:00', action: 'Tâche terminée', actor: 'bd@pharma.ma', details: 'T1.1 — Nom commercial transmis.' },
  { id: 'al-003', project_id: 'proj-001', timestamp: '2026-01-22T14:00:00', action: 'Tâche terminée', actor: 'validation@pharma.ma', details: 'T1.2 — Caractéristiques techniques transmises.' },
  { id: 'al-004', project_id: 'proj-001', timestamp: '2026-02-05T11:00:00', action: 'Document approuvé', actor: 'ar@pharma.ma', details: 'Dossier pré-soumission v2 approuvé.' },
  { id: 'al-005', project_id: 'proj-001', timestamp: '2026-02-10T16:00:00', action: 'Étape terminée', actor: 'system', details: 'Étape 1 — Préparation technique & réglementaire terminée.' },
  { id: 'al-006', project_id: 'proj-001', timestamp: '2026-03-15T09:30:00', action: 'Étape terminée', actor: 'system', details: 'Étape 2 — Commande & approvisionnement terminée.' },
  { id: 'al-007', project_id: 'proj-001', timestamp: '2026-03-16T08:00:00', action: 'Tâche démarrée', actor: 'validation@pharma.ma', details: 'T3.1 — Change control eQMS lancé.' },
  { id: 'al-008', project_id: 'proj-001', timestamp: '2026-03-20T10:00:00', action: 'Tâche bloquée', actor: 'system', details: 'T3.2 — Bloquée: en attente de finalisation du change control.' },
];
