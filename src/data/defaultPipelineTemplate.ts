import type { PipelineTemplate } from '@/types/pipelineTemplate';

export const DEFAULT_PIPELINE_TEMPLATE: PipelineTemplate = {
  id: 'tpl-default',
  name: 'Pipeline Validation Produit',
  description: 'Pipeline standard de validation d\'un nouveau produit (pharma/cosmétique).',
  steps: [
    {
      id: 'st-1',
      name: 'Préparation technique & réglementaire',
      order: 1,
      tasks: [
        { id: 'tt-1.1', title: 'Transmettre nom commercial', description: 'Communiquer le nom commercial définitif.', owner_role: 'Business Developer', dependency_task_ids: [], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-1.2', title: 'Transmettre caractéristiques techniques', description: 'Fournir les spécifications techniques du produit.', owner_role: 'Validation', dependency_task_ids: [], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-1.3', title: 'Préparer dossier de pré-soumission', description: 'Compilation du dossier réglementaire.', owner_role: 'AR', dependency_task_ids: ['tt-1.1', 'tt-1.2'], approval_required: true, approver_roles: ['AR', 'Validation'], priority: 'High' },
        { id: 'tt-1.4', title: 'Préparer maquettes BAT', description: 'Création des maquettes Bon À Tirer.', owner_role: 'Marketing', dependency_task_ids: ['tt-1.1', 'tt-1.2'], approval_required: true, approver_roles: ['Marketing', 'AR'], priority: 'Med' },
        { id: 'tt-1.5', title: "Préparer programme d'importation", description: "Élaboration du programme d'importation.", owner_role: 'AR', dependency_task_ids: ['tt-1.3'], approval_required: false, approver_roles: [], priority: 'Med' },
      ],
      gate: undefined,
    },
    {
      id: 'st-2',
      name: 'Commande & approvisionnement des intrants',
      order: 2,
      tasks: [
        { id: 'tt-2.1', title: 'Commander intrants production', description: 'Passer les commandes pour les intrants.', owner_role: 'Supply', dependency_task_ids: ['tt-1.2'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-2.2', title: 'Identifier intrants QC', description: 'Identifier les intrants nécessaires au QC.', owner_role: 'QC', dependency_task_ids: ['tt-1.2'], approval_required: false, approver_roles: [], priority: 'Med' },
        { id: 'tt-2.3', title: 'Commander intrants QC', description: 'Commander les intrants QC identifiés.', owner_role: 'Supply', dependency_task_ids: ['tt-2.2'], approval_required: false, approver_roles: [], priority: 'Med' },
        { id: 'tt-2.4', title: 'Commander outillage production', description: 'Commander l\'outillage nécessaire.', owner_role: 'Bureau Méthodes', dependency_task_ids: ['tt-1.2'], approval_required: false, approver_roles: [], priority: 'Med' },
        { id: 'tt-2.5', title: 'Suivre commandes intrants', description: 'Suivi des commandes intrants.', owner_role: 'Supply', dependency_task_ids: ['tt-2.1', 'tt-2.3'], approval_required: false, approver_roles: [], priority: 'Med' },
        { id: 'tt-2.6', title: 'Suivre commandes outillage', description: 'Suivi des commandes outillage.', owner_role: 'Bureau Méthodes', dependency_task_ids: ['tt-2.4'], approval_required: false, approver_roles: [], priority: 'Med' },
        { id: 'tt-2.7', title: 'Réception/contrôle/libération intrants', description: 'Réceptionner, contrôler et libérer les intrants.', owner_role: 'Supply', dependency_task_ids: ['tt-2.1', 'tt-2.3'], approval_required: true, approver_roles: ['QC', 'Supply'], priority: 'High' },
      ],
      gate: { required_task_ids: ['tt-2.7', 'tt-2.4'] },
    },
    {
      id: 'st-3',
      name: 'Change control',
      order: 3,
      tasks: [
        { id: 'tt-3.1', title: 'Lancer change control eQMS', description: 'Initier le change control dans le système eQMS.', owner_role: 'Validation', dependency_task_ids: ['tt-2.7', 'tt-2.4'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-3.2', title: 'Créer documentation de validation', description: 'Rédiger la documentation nécessaire.', owner_role: 'Validation', dependency_task_ids: ['tt-3.1'], approval_required: true, approver_roles: ['Validation', 'QC'], priority: 'High' },
      ],
      gate: { required_task_ids: ['tt-3.1', 'tt-3.2'] },
    },
    {
      id: 'st-4',
      name: 'Planification industrielle',
      order: 4,
      tasks: [
        { id: 'tt-4.1', title: 'Programmer réunion planification', description: 'Organiser la réunion de planification.', owner_role: 'Validation', dependency_task_ids: ['tt-3.1'], approval_required: false, approver_roles: [], priority: 'Med' },
        { id: 'tt-4.2', title: 'Élaborer planning lots validation', description: 'Définir le planning de fabrication des lots.', owner_role: 'Ordonnancement', dependency_task_ids: ['tt-4.1'], approval_required: true, approver_roles: ['Validation', 'Production'], priority: 'High' },
      ],
      gate: { required_task_ids: ['tt-4.2'] },
    },
    {
      id: 'st-5',
      name: 'Validation & stabilité',
      order: 5,
      tasks: [
        { id: 'tt-5.1', title: 'Fabrication lots validation', description: 'Fabriquer les lots de validation.', owner_role: 'Production', dependency_task_ids: ['tt-4.2'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-5.2', title: 'Conditionnement lots validation', description: 'Conditionner les lots de validation.', owner_role: 'Production', dependency_task_ids: ['tt-5.1'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-5.3', title: 'Mise en stabilité', description: 'Mise en stabilité des lots.', owner_role: 'QC', dependency_task_ids: ['tt-5.2'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-5.4', title: 'Suivi points stabilité', description: 'Suivre les points de stabilité.', owner_role: 'QC', dependency_task_ids: ['tt-5.3'], approval_required: false, approver_roles: [], priority: 'High' },
      ],
      gate: { required_task_ids: ['tt-5.4'] },
    },
    {
      id: 'st-6',
      name: 'Préparation de la documentation',
      order: 6,
      tasks: [
        { id: 'tt-6.1', title: 'Transmettre documents de validation', description: 'Transmettre les docs de validation.', owner_role: 'Validation', dependency_task_ids: ['tt-5.4'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-6.2', title: 'Transmettre documents de contrôle', description: 'Transmettre les docs QC.', owner_role: 'QC', dependency_task_ids: ['tt-5.4'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-6.3', title: 'Transmettre documents intrants production', description: 'Transmettre les docs intrants.', owner_role: 'Supply', dependency_task_ids: ['tt-2.7'], approval_required: false, approver_roles: [], priority: 'Med' },
      ],
      gate: { required_task_ids: ['tt-6.1', 'tt-6.2', 'tt-6.3'] },
    },
    {
      id: 'st-7',
      name: 'Enregistrement',
      order: 7,
      tasks: [
        { id: 'tt-7.1', title: 'Compiler modules qualité dossier AMM', description: 'Compiler les modules qualité.', owner_role: 'AR', dependency_task_ids: ['tt-6.1', 'tt-6.2', 'tt-6.3'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-7.2', title: 'Revue interne dossier AMM', description: 'Revue interne du dossier.', owner_role: 'AR', dependency_task_ids: ['tt-7.1'], approval_required: true, approver_roles: ['AR', 'Validation'], priority: 'High' },
        { id: 'tt-7.3', title: 'Soumission dossier AMM', description: 'Soumettre le dossier AMM.', owner_role: 'AR', dependency_task_ids: ['tt-7.2'], approval_required: true, approver_roles: ['AR'], priority: 'High' },
        { id: 'tt-7.4', title: 'Suivi réserves autorités', description: 'Suivi des réserves des autorités.', owner_role: 'AR', dependency_task_ids: ['tt-7.3'], approval_required: false, approver_roles: [], priority: 'High' },
      ],
      gate: { required_task_ids: ['tt-7.4'] },
    },
    {
      id: 'st-8',
      name: 'Clôture',
      order: 8,
      tasks: [
        { id: 'tt-8.1', title: 'Obtenir DE', description: 'Obtenir la Décision d\'Enregistrement.', owner_role: 'AR', dependency_task_ids: ['tt-7.4'], approval_required: false, approver_roles: [], priority: 'High' },
        { id: 'tt-8.2', title: 'Mise à jour maquettes BAT', description: 'Mettre à jour les maquettes BAT.', owner_role: 'Marketing', dependency_task_ids: ['tt-8.1'], approval_required: false, approver_roles: [], priority: 'Med' },
        { id: 'tt-8.3', title: 'Clôturer change control', description: 'Clôturer le change control.', owner_role: 'Validation', dependency_task_ids: ['tt-8.1'], approval_required: false, approver_roles: [], priority: 'Med' },
      ],
      gate: undefined,
    },
  ],
};
