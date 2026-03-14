import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Document, Batch, AuditEntry, Approval } from '@/types/project';

export function useProjectDocuments(projectId: string | undefined) {
  const [documents, setDocuments] = useState<Document[]>([]);
  useEffect(() => {
    if (!projectId) return;
    supabase.from('documents').select('*').eq('project_id', projectId).then(({ data }) => {
      if (data) setDocuments(data as any);
    });
  }, [projectId]);
  return documents;
}

export function useProjectBatches(projectId: string | undefined) {
  const [batches, setBatches] = useState<Batch[]>([]);
  useEffect(() => {
    if (!projectId) return;
    supabase.from('batches').select('*').eq('project_id', projectId).then(({ data }) => {
      if (data) setBatches(data as any);
    });
  }, [projectId]);
  return batches;
}

export function useProjectAuditLog(projectId: string | undefined) {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  useEffect(() => {
    if (!projectId) return;
    supabase.from('audit_log').select('*').eq('project_id', projectId).order('timestamp').then(({ data }) => {
      if (data) setAuditLog(data as any);
    });
  }, [projectId]);
  return auditLog;
}
