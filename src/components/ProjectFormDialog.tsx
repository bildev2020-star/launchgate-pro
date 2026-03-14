import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePipelineTemplate } from '@/contexts/PipelineTemplateContext';
import { useProjects } from '@/contexts/ProjectsContext';
import { toast } from '@/hooks/use-toast';
import { FlaskConical, Layers } from 'lucide-react';
import type { Project, ProductType, Role, ProjectStatus } from '@/types/project';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, edit mode */
  project?: Project;
  onCreated?: (id: string) => void;
}

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'pharma', label: 'Pharmaceutique' },
  { value: 'cosmetique', label: 'Cosmétique' },
  { value: 'DM', label: 'Dispositif médical' },
  { value: 'autre', label: 'Autre' },
];

const ROLES: Role[] = ['Business Developer', 'Marketing', 'AR', 'Supply', 'QC', 'Bureau Méthodes', 'Validation', 'Ordonnancement', 'Production'];

export function ProjectFormDialog({ open, onOpenChange, project, onCreated }: ProjectFormDialogProps) {
  const { templates, activeTemplateId } = usePipelineTemplate();
  const [selectedTemplateId, setSelectedTemplateId] = useState(activeTemplateId);
  const { addProject, updateProject, updateProjectFromTemplate } = useProjects();
  const isEdit = !!project;
  const template = templates.find(t => t.id === selectedTemplateId) ?? templates[0];

  const [form, setForm] = useState({
    code_projet: project?.code_projet ?? '',
    produit_nom: project?.produit_nom ?? '',
    produit_type: (project?.produit_type ?? 'pharma') as ProductType,
    site: project?.site ?? '',
    statut: (project?.statut ?? 'Initiated') as ProjectStatus,
    owner_role: (project?.owner_role ?? 'Validation') as Role,
    target_DE_date: project?.target_DE_date ?? '',
    target_AMM_submission_date: project?.target_AMM_submission_date ?? '',
    description: project?.description ?? '',
  });

  const [applyTemplate, setApplyTemplate] = useState(!isEdit);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.produit_nom.trim() || !form.code_projet.trim()) {
      toast({ title: 'Champs requis', description: 'Le code projet et le nom du produit sont obligatoires.', variant: 'destructive' });
      return;
    }

    if (isEdit && project) {
      updateProject(project.id, form);
      if (applyTemplate) {
        updateProjectFromTemplate(project.id, template);
        toast({ title: 'Projet mis à jour', description: 'Le pipeline a été régénéré depuis le template.' });
      } else {
        toast({ title: 'Projet mis à jour' });
      }
    } else {
      addProject(form, template).then(id => {
        toast({ title: 'Projet créé', description: `${form.produit_nom} — ${template.steps.length} étapes générées depuis le template.` });
        onCreated?.(id);
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            {isEdit ? 'Modifier le projet' : 'Nouveau projet'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Project info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code projet *</Label>
              <Input value={form.code_projet} onChange={e => update('code_projet', e.target.value)} placeholder="VAL-2026-XXX" />
            </div>
            <div>
              <Label>Nom du produit *</Label>
              <Input value={form.produit_nom} onChange={e => update('produit_nom', e.target.value)} placeholder="Ex: Amoxicilline 500mg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type de produit</Label>
              <Select value={form.produit_type} onValueChange={v => update('produit_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Site</Label>
              <Input value={form.site} onChange={e => update('site', e.target.value)} placeholder="Ex: Site Casablanca" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rôle propriétaire</Label>
              <Select value={form.owner_role} onValueChange={v => update('owner_role', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {isEdit && (
              <div>
                <Label>Statut</Label>
                <Select value={form.statut} onValueChange={v => update('statut', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initiated">Initié</SelectItem>
                    <SelectItem value="Running">En cours</SelectItem>
                    <SelectItem value="Blocked">Bloqué</SelectItem>
                    <SelectItem value="ReadyForSubmission">Prêt soumission</SelectItem>
                    <SelectItem value="Submitted">Soumis</SelectItem>
                    <SelectItem value="Closed">Clôturé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date cible soumission AMM</Label>
              <Input type="date" value={form.target_AMM_submission_date} onChange={e => update('target_AMM_submission_date', e.target.value)} />
            </div>
            <div>
              <Label>Date cible DE</Label>
              <Input type="date" value={form.target_DE_date} onChange={e => update('target_DE_date', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Description du projet..." />
          </div>

          <Separator />

          {/* Template section */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Template Pipeline</span>
              </div>
              {isEdit && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyTemplate}
                    onChange={e => setApplyTemplate(e.target.checked)}
                    className="rounded"
                  />
                  Régénérer depuis le template
                </label>
              )}
            </div>

            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.steps.length} étapes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">{template.description}</p>

            <div className="flex flex-wrap gap-2">
              {template.steps.map(step => (
                <Badge key={step.id} variant="secondary" className="text-xs">
                  {step.order}. {step.name}
                  <span className="ml-1 text-muted-foreground">({step.tasks.length})</span>
                </Badge>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {template.steps.length} étapes • {template.steps.reduce((acc, s) => acc + s.tasks.length, 0)} tâches seront générées automatiquement
              {isEdit && !applyTemplate && ' (non appliqué)'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit}>
            {isEdit ? 'Enregistrer' : 'Créer le projet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
