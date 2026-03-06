import { useState } from 'react';
import { useRoles, type RoleConfig } from '@/contexts/RolesContext';
import type { TeamMember } from '@/data/teamMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Pencil, Trash2, UserPlus, X, Search, Users, Shield, ChevronDown, ChevronUp,
} from 'lucide-react';

export default function RolesSettingsPage() {
  const { roles, members, addRole, updateRole, deleteRole, assignMember, unassignMember, getMembersForRole } = useRoles();

  const [search, setSearch] = useState('');
  const [editDialog, setEditDialog] = useState<{ open: boolean; role?: RoleConfig }>({ open: false });
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; roleId?: string }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setFormName('');
    setFormDesc('');
    setEditDialog({ open: true });
  };

  const openEdit = (role: RoleConfig) => {
    setFormName(role.name);
    setFormDesc(role.description);
    setEditDialog({ open: true, role });
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editDialog.role) {
      updateRole(editDialog.role.id, { name: formName.trim() as any, description: formDesc.trim() });
    } else {
      addRole(formName.trim(), formDesc.trim());
    }
    setEditDialog({ open: false });
  };

  const openAssign = (roleId: string) => {
    setMemberSearch('');
    setAssignDialog({ open: true, roleId });
  };

  const getUnassignedMembers = (roleId: string) => {
    const assigned = getMembersForRole(roleId);
    const assignedIds = new Set(assigned.map(m => m.id));
    return members.filter(m =>
      !assignedIds.has(m.id) &&
      (m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase()))
    );
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            Gestion des Rôles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les rôles et assignez les membres de l'équipe
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau rôle
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un rôle…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{roles.length}</p>
              <p className="text-xs text-muted-foreground">Rôles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
              <p className="text-xs text-muted-foreground">Membres</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles list */}
      <div className="space-y-3">
        {filteredRoles.map(role => {
          const roleMembers = getMembersForRole(role.id);
          const isExpanded = expandedRole === role.id;

          return (
            <Card key={role.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full ${role.color}`} />
                    <div className="min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground">{role.name}</CardTitle>
                      <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Users className="h-3 w-3" />
                      {roleMembers.length}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAssign(role.id)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Assigner un membre</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Modifier</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(role.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Supprimer</TooltipContent>
                    </Tooltip>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Collapsed: avatar row */}
              {!isExpanded && roleMembers.length > 0 && (
                <CardContent className="px-4 pb-3 pt-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    {roleMembers.slice(0, 6).map(m => (
                      <Tooltip key={m.id}>
                        <TooltipTrigger asChild>
                          <Avatar className="h-7 w-7 border-2 border-card">
                            <AvatarFallback className={`${m.avatar_color} text-white text-[10px] font-medium`}>
                              {m.avatar_initials}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>{m.name}</TooltipContent>
                      </Tooltip>
                    ))}
                    {roleMembers.length > 6 && (
                      <span className="text-xs text-muted-foreground ml-1">+{roleMembers.length - 6}</span>
                    )}
                  </div>
                </CardContent>
              )}

              {/* Expanded: full member list */}
              {isExpanded && (
                <CardContent className="px-4 pb-4 pt-0">
                  {roleMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-2">Aucun membre assigné</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {roleMembers.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={`${m.avatar_color} text-white text-xs font-medium`}>
                                {m.avatar_initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{m.name}</p>
                              <p className="text-xs text-muted-foreground">{m.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => unassignMember(role.id, m.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => openAssign(role.id)}>
                    <UserPlus className="h-3.5 w-3.5" />
                    Assigner un membre
                  </Button>
                </CardContent>
              )}
            </Card>
          );
        })}

        {filteredRoles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aucun rôle trouvé</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={open => !open && setEditDialog({ open: false })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editDialog.role ? 'Modifier le rôle' : 'Nouveau rôle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nom du rôle</Label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Pharmacovigilance" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Décrivez les responsabilités…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false })}>Annuler</Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>
              {editDialog.role ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Member Dialog */}
      <Dialog open={assignDialog.open} onOpenChange={open => !open && setAssignDialog({ open: false })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assigner un membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre…"
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {assignDialog.roleId && getUnassignedMembers(assignDialog.roleId).map(m => (
                <button
                  key={m.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/10 transition-colors text-left"
                  onClick={() => {
                    assignMember(assignDialog.roleId!, m.id);
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${m.avatar_color} text-white text-xs font-medium`}>
                      {m.avatar_initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </button>
              ))}
              {assignDialog.roleId && getUnassignedMembers(assignDialog.roleId).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Tous les membres sont déjà assignés</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={open => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce rôle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les assignations liées seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteConfirm) deleteRole(deleteConfirm); setDeleteConfirm(null); }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
