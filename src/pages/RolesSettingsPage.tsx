import { useState } from 'react';
import { useRoles, type RoleConfig } from '@/contexts/RolesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, Pencil, Trash2, Search, Users, Shield, X,
} from 'lucide-react';

export default function RolesSettingsPage() {
  const { roles, members, addRole, updateRole, deleteRole, assignMember, unassignMember, getRolesForMember } = useRoles();

  const [search, setSearch] = useState('');
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; role?: RoleConfig }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateRole = () => {
    setFormName('');
    setFormDesc('');
    setRoleDialog({ open: true });
  };

  const openEditRole = (role: RoleConfig) => {
    setFormName(role.name);
    setFormDesc(role.description);
    setRoleDialog({ open: true, role });
  };

  const handleSaveRole = () => {
    if (!formName.trim()) return;
    if (roleDialog.role) {
      updateRole(roleDialog.role.id, { name: formName.trim() as any, description: formDesc.trim() });
    } else {
      addRole(formName.trim(), formDesc.trim());
    }
    setRoleDialog({ open: false });
  };

  const handleAssignRole = (memberId: string, roleId: string) => {
    // Remove existing roles for this member, then assign the new one
    const currentRoles = getRolesForMember(memberId);
    currentRoles.forEach(r => unassignMember(r.id, memberId));
    if (roleId !== '__none__') {
      assignMember(roleId, memberId);
    }
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
            Assignez un rôle à chaque membre de l'équipe
          </p>
        </div>
      </div>

      {/* Stats + Role management */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1">
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
        <Card className="flex-1">
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
      </div>

      {/* Roles chips + manage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Rôles disponibles</h2>
          <Button variant="outline" size="sm" onClick={openCreateRole} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nouveau rôle
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map(role => {
            const count = members.filter(m => getRolesForMember(m.id).some(r => r.id === role.id)).length;
            return (
              <div
                key={role.id}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${role.color}`} />
                <span className="text-sm font-medium text-foreground">{role.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 min-w-[1.25rem] justify-center">
                  {count}
                </Badge>
                <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                  <button
                    className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => openEditRole(role)}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => setDeleteConfirm(role.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un membre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Members list */}
      <div className="space-y-2">
        {filteredMembers.map(member => {
          const memberRoles = getRolesForMember(member.id);
          const currentRoleId = memberRoles.length > 0 ? memberRoles[0].id : '__none__';

          return (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className={`${member.avatar_color} text-white text-sm font-medium`}>
                    {member.avatar_initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
                <Select
                  value={currentRoleId}
                  onValueChange={(value) => handleAssignRole(member.id, value)}
                >
                  <SelectTrigger className="w-[180px] sm:w-[220px]">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-muted-foreground">Aucun rôle</span>
                    </SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${role.color}`} />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aucun membre trouvé</p>
          </div>
        )}
      </div>

      {/* Create/Edit Role Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={open => !open && setRoleDialog({ open: false })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{roleDialog.role ? 'Modifier le rôle' : 'Nouveau rôle'}</DialogTitle>
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
            <Button variant="outline" onClick={() => setRoleDialog({ open: false })}>Annuler</Button>
            <Button onClick={handleSaveRole} disabled={!formName.trim()}>
              {roleDialog.role ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
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
