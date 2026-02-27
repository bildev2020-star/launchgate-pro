import type { Step } from '@/types/project';
import { StatusBadge } from './StatusBadge';
import { CheckCircle2 } from 'lucide-react';

interface StepTimelineProps {
  steps: Step[];
  onStepClick?: (step: Step) => void;
  activeStepId?: string;
}

export function StepTimeline({ steps, onStepClick, activeStepId }: StepTimelineProps) {
  return (
    <div className="w-full">
      {/* Desktop horizontal */}
      <div className="hidden md:flex items-start gap-0 w-full">
        {steps.map((step, i) => {
          const isDone = step.statut === 'Done' || step.statut === 'Approved';
          const isActive = step.id === activeStepId || step.statut === 'InProgress';
          const isPast = isDone;

          return (
            <div key={step.id} className="flex items-start flex-1 min-w-0">
              <button
                onClick={() => onStepClick?.(step)}
                className={`flex flex-col items-center text-center group cursor-pointer flex-1 min-w-0 ${
                  isActive ? '' : 'opacity-70 hover:opacity-100'
                } transition-opacity`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                    isDone
                      ? 'bg-success border-success text-success-foreground'
                      : isActive
                      ? 'bg-in-progress border-in-progress text-in-progress-foreground ring-4 ring-in-progress/20'
                      : step.statut === 'Blocked'
                      ? 'bg-blocked border-blocked text-blocked-foreground'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-5 w-5" /> : step.order}
                </div>
                <p className={`mt-2 text-xs leading-tight max-w-[100px] ${
                  isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.name}
                </p>
              </button>
              {i < steps.length - 1 && (
                <div className="flex items-center pt-5 px-1">
                  <div className={`step-connector ${isPast ? 'bg-success' : 'bg-border'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical */}
      <div className="md:hidden space-y-3">
        {steps.map((step) => {
          const isDone = step.statut === 'Done' || step.statut === 'Approved';
          const isActive = step.statut === 'InProgress';
          return (
            <button
              key={step.id}
              onClick={() => onStepClick?.(step)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isActive
                  ? 'border-in-progress/50 bg-in-progress/5'
                  : isDone
                  ? 'border-success/30 bg-success/5'
                  : 'border-border bg-card'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isDone
                    ? 'bg-success text-success-foreground'
                    : isActive
                    ? 'bg-in-progress text-in-progress-foreground'
                    : step.statut === 'Blocked'
                    ? 'bg-blocked text-blocked-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.order}
              </div>
              <span className={`text-sm truncate ${isActive ? 'font-semibold' : ''}`}>{step.name}</span>
              <div className="ml-auto shrink-0">
                <StatusBadge status={step.statut} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
