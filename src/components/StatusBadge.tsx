import type { GlobalStatus, ProjectStatus, BatchStatus, DocumentStatus, ApprovalDecision } from '@/types/project';
import { CheckCircle2, Clock, PlayCircle, Ban, Eye, RotateCcw, XCircle, FileEdit, AlertTriangle } from 'lucide-react';

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}

const statusMap: Record<string, StatusConfig> = {
  Draft: { label: 'Brouillon', className: 'bg-draft/15 text-draft', icon: FileEdit },
  Ready: { label: 'Prêt', className: 'bg-accent/15 text-accent', icon: Clock },
  InProgress: { label: 'En cours', className: 'bg-in-progress/15 text-in-progress', icon: PlayCircle },
  Blocked: { label: 'Bloqué', className: 'bg-blocked/15 text-blocked', icon: Ban },
  InReview: { label: 'En revue', className: 'bg-in-review/15 text-in-review', icon: Eye },
  Approved: { label: 'Approuvé', className: 'bg-success/15 text-success', icon: CheckCircle2 },
  Done: { label: 'Terminé', className: 'bg-success/15 text-success', icon: CheckCircle2 },
  Rework: { label: 'Reprise', className: 'bg-warning/15 text-warning', icon: RotateCcw },
  Cancelled: { label: 'Annulé', className: 'bg-muted text-muted-foreground', icon: XCircle },
  // Project-specific
  Initiated: { label: 'Initié', className: 'bg-draft/15 text-draft', icon: FileEdit },
  Running: { label: 'En cours', className: 'bg-in-progress/15 text-in-progress', icon: PlayCircle },
  ReadyForSubmission: { label: 'Prêt soumission', className: 'bg-accent/15 text-accent', icon: CheckCircle2 },
  Submitted: { label: 'Soumis', className: 'bg-in-review/15 text-in-review', icon: Eye },
  Closed: { label: 'Clôturé', className: 'bg-success/15 text-success', icon: CheckCircle2 },
  // Batch
  Planned: { label: 'Planifié', className: 'bg-draft/15 text-draft', icon: Clock },
  Manufactured: { label: 'Fabriqué', className: 'bg-in-progress/15 text-in-progress', icon: PlayCircle },
  Packaged: { label: 'Conditionné', className: 'bg-accent/15 text-accent', icon: CheckCircle2 },
  InStability: { label: 'En stabilité', className: 'bg-warning/15 text-warning', icon: AlertTriangle },
  // Document
  Rejected: { label: 'Rejeté', className: 'bg-blocked/15 text-blocked', icon: XCircle },
  Pending: { label: 'En attente', className: 'bg-warning/15 text-warning', icon: Clock },
};

type AnyStatus = GlobalStatus | ProjectStatus | BatchStatus | DocumentStatus | ApprovalDecision;

export function StatusBadge({ status }: { status: AnyStatus }) {
  const config = statusMap[status] || { label: status, className: 'bg-muted text-muted-foreground', icon: Clock };
  const Icon = config.icon;
  return (
    <span className={`status-pill ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
