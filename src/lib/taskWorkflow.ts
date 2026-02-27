import type { GlobalStatus } from '@/types/project';

interface Transition {
  label: string;
  to: GlobalStatus;
  variant: 'default' | 'accent' | 'warning' | 'destructive' | 'success';
}

export const TASK_TRANSITIONS: Record<GlobalStatus, Transition[]> = {
  Draft: [
    { label: 'Préparer', to: 'Ready', variant: 'accent' },
  ],
  Ready: [
    { label: 'Démarrer', to: 'InProgress', variant: 'accent' },
    { label: 'Retour brouillon', to: 'Draft', variant: 'default' },
  ],
  InProgress: [
    { label: 'Soumettre en revue', to: 'InReview', variant: 'accent' },
    { label: 'Terminer', to: 'Done', variant: 'success' },
    { label: 'Bloquer', to: 'Blocked', variant: 'destructive' },
  ],
  Blocked: [
    { label: 'Débloquer', to: 'InProgress', variant: 'accent' },
    { label: 'Annuler', to: 'Cancelled', variant: 'destructive' },
  ],
  InReview: [
    { label: 'Approuver', to: 'Approved', variant: 'success' },
    { label: 'Rejeter → Reprise', to: 'Rework', variant: 'warning' },
  ],
  Approved: [
    { label: 'Rouvrir', to: 'InProgress', variant: 'default' },
  ],
  Done: [
    { label: 'Rouvrir', to: 'InProgress', variant: 'default' },
  ],
  Rework: [
    { label: 'Reprendre', to: 'InProgress', variant: 'accent' },
  ],
  Cancelled: [
    { label: 'Réactiver', to: 'Draft', variant: 'default' },
  ],
};
