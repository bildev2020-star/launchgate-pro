
-- Enums
CREATE TYPE public.product_type AS ENUM ('pharma', 'cosmetique', 'DM', 'autre');
CREATE TYPE public.project_status AS ENUM ('Initiated', 'Running', 'Blocked', 'ReadyForSubmission', 'Submitted', 'Closed');
CREATE TYPE public.global_status AS ENUM ('Draft', 'Ready', 'InProgress', 'Blocked', 'InReview', 'Approved', 'Done', 'Rework', 'Cancelled');
CREATE TYPE public.document_type AS ENUM ('fiche_technique', 'dossier_pre_soumission', 'BAT', 'programme_importation', 'commande_intrants', 'reception_liberation', 'change_control', 'doc_validation', 'planning_lots', 'dossier_lot', 'rapport_QC', 'rapport_stabilite', 'modules_qualite_AMM', 'DE', 'autres');
CREATE TYPE public.document_status AS ENUM ('Draft', 'InReview', 'Approved', 'Rejected');
CREATE TYPE public.approval_decision AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE public.batch_status AS ENUM ('Planned', 'Manufactured', 'Packaged', 'InStability', 'Closed');
CREATE TYPE public.stability_timepoint AS ENUM ('T0', 'T3', 'T6', 'T9', 'T12', 'Custom');
CREATE TYPE public.priority_level AS ENUM ('Low', 'Med', 'High');
CREATE TYPE public.approval_object_type AS ENUM ('Task', 'Document', 'Step', 'Project');

-- Projects
CREATE TABLE public.projects (
  id TEXT PRIMARY KEY,
  code_projet TEXT NOT NULL,
  produit_nom TEXT NOT NULL,
  produit_type public.product_type NOT NULL DEFAULT 'pharma',
  site TEXT NOT NULL DEFAULT '',
  statut public.project_status NOT NULL DEFAULT 'Initiated',
  owner_role TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  target_de_date DATE,
  target_amm_submission_date DATE,
  description TEXT NOT NULL DEFAULT ''
);

-- Steps
CREATE TABLE public.steps (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  statut public.global_status NOT NULL DEFAULT 'Draft',
  start_date DATE,
  due_date DATE,
  end_date DATE
);

-- Tasks
CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  step_id TEXT NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  owner_role TEXT NOT NULL DEFAULT '',
  assignee TEXT,
  due_date DATE,
  statut public.global_status NOT NULL DEFAULT 'Draft',
  dependency_task_ids TEXT[] NOT NULL DEFAULT '{}',
  approval_required BOOLEAN NOT NULL DEFAULT FALSE,
  approver_roles TEXT[] NOT NULL DEFAULT '{}',
  blocking_reason TEXT,
  priority public.priority_level NOT NULL DEFAULT 'Med',
  created_at DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  step_order INTEGER NOT NULL DEFAULT 1
);

-- Documents
CREATE TABLE public.documents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL REFERENCES public.steps(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
  type public.document_type NOT NULL,
  filename TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  statut public.document_status NOT NULL DEFAULT 'Draft',
  uploaded_by TEXT NOT NULL DEFAULT '',
  uploaded_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Approvals
CREATE TABLE public.approvals (
  id TEXT PRIMARY KEY,
  object_type public.approval_object_type NOT NULL,
  object_id TEXT NOT NULL,
  approver_role TEXT NOT NULL,
  decision public.approval_decision NOT NULL DEFAULT 'Pending',
  decided_at DATE,
  comment TEXT
);

-- Batches
CREATE TABLE public.batches (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  batch_code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Validation',
  statut public.batch_status NOT NULL DEFAULT 'Planned',
  manufactured_at DATE,
  packaged_at DATE,
  stability_started_at DATE
);

-- Stability Points
CREATE TABLE public.stability_points (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  timepoint public.stability_timepoint NOT NULL,
  due_date DATE NOT NULL,
  statut public.global_status NOT NULL DEFAULT 'Draft',
  result_document_id TEXT REFERENCES public.documents(id) ON DELETE SET NULL
);

-- Audit Log
CREATE TABLE public.audit_log (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT ''
);

-- Team Members
CREATE TABLE public.team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_initials TEXT NOT NULL DEFAULT '',
  avatar_color TEXT NOT NULL DEFAULT ''
);

-- Role Configs
CREATE TABLE public.role_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'bg-chart-1'
);

-- Disable RLS for now (public data, no auth yet)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stability_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_configs ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (will be restricted when auth is added)
CREATE POLICY "Allow all access" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.steps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.approvals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.stability_points FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.audit_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.role_configs FOR ALL USING (true) WITH CHECK (true);
