export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      approvals: {
        Row: {
          approver_role: string
          comment: string | null
          decided_at: string | null
          decision: Database["public"]["Enums"]["approval_decision"]
          id: string
          object_id: string
          object_type: Database["public"]["Enums"]["approval_object_type"]
        }
        Insert: {
          approver_role: string
          comment?: string | null
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["approval_decision"]
          id: string
          object_id: string
          object_type: Database["public"]["Enums"]["approval_object_type"]
        }
        Update: {
          approver_role?: string
          comment?: string | null
          decided_at?: string | null
          decision?: Database["public"]["Enums"]["approval_decision"]
          id?: string
          object_id?: string
          object_type?: Database["public"]["Enums"]["approval_object_type"]
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string
          details: string
          id: string
          project_id: string
          timestamp: string
        }
        Insert: {
          action: string
          actor: string
          details?: string
          id: string
          project_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          actor?: string
          details?: string
          id?: string
          project_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          batch_code: string
          id: string
          manufactured_at: string | null
          packaged_at: string | null
          project_id: string
          stability_started_at: string | null
          statut: Database["public"]["Enums"]["batch_status"]
          type: string
        }
        Insert: {
          batch_code: string
          id: string
          manufactured_at?: string | null
          packaged_at?: string | null
          project_id: string
          stability_started_at?: string | null
          statut?: Database["public"]["Enums"]["batch_status"]
          type?: string
        }
        Update: {
          batch_code?: string
          id?: string
          manufactured_at?: string | null
          packaged_at?: string | null
          project_id?: string
          stability_started_at?: string | null
          statut?: Database["public"]["Enums"]["batch_status"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          filename: string
          id: string
          project_id: string
          statut: Database["public"]["Enums"]["document_status"]
          step_id: string
          task_id: string | null
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at: string
          uploaded_by: string
          version: string
        }
        Insert: {
          filename: string
          id: string
          project_id: string
          statut?: Database["public"]["Enums"]["document_status"]
          step_id: string
          task_id?: string | null
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string
          uploaded_by?: string
          version?: string
        }
        Update: {
          filename?: string
          id?: string
          project_id?: string
          statut?: Database["public"]["Enums"]["document_status"]
          step_id?: string
          task_id?: string | null
          type?: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string
          uploaded_by?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code_projet: string
          created_at: string
          created_by: string
          description: string
          id: string
          owner_role: string
          produit_nom: string
          produit_type: Database["public"]["Enums"]["product_type"]
          site: string
          statut: Database["public"]["Enums"]["project_status"]
          target_amm_submission_date: string | null
          target_de_date: string | null
        }
        Insert: {
          code_projet: string
          created_at?: string
          created_by?: string
          description?: string
          id: string
          owner_role?: string
          produit_nom: string
          produit_type?: Database["public"]["Enums"]["product_type"]
          site?: string
          statut?: Database["public"]["Enums"]["project_status"]
          target_amm_submission_date?: string | null
          target_de_date?: string | null
        }
        Update: {
          code_projet?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          owner_role?: string
          produit_nom?: string
          produit_type?: Database["public"]["Enums"]["product_type"]
          site?: string
          statut?: Database["public"]["Enums"]["project_status"]
          target_amm_submission_date?: string | null
          target_de_date?: string | null
        }
        Relationships: []
      }
      role_configs: {
        Row: {
          color: string
          description: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          description?: string
          id: string
          name: string
        }
        Update: {
          color?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      stability_points: {
        Row: {
          batch_id: string
          due_date: string
          id: string
          project_id: string
          result_document_id: string | null
          statut: Database["public"]["Enums"]["global_status"]
          timepoint: Database["public"]["Enums"]["stability_timepoint"]
        }
        Insert: {
          batch_id: string
          due_date: string
          id: string
          project_id: string
          result_document_id?: string | null
          statut?: Database["public"]["Enums"]["global_status"]
          timepoint: Database["public"]["Enums"]["stability_timepoint"]
        }
        Update: {
          batch_id?: string
          due_date?: string
          id?: string
          project_id?: string
          result_document_id?: string | null
          statut?: Database["public"]["Enums"]["global_status"]
          timepoint?: Database["public"]["Enums"]["stability_timepoint"]
        }
        Relationships: [
          {
            foreignKeyName: "stability_points_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stability_points_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stability_points_result_document_id_fkey"
            columns: ["result_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      steps: {
        Row: {
          due_date: string | null
          end_date: string | null
          id: string
          name: string
          order: number
          project_id: string
          start_date: string | null
          statut: Database["public"]["Enums"]["global_status"]
        }
        Insert: {
          due_date?: string | null
          end_date?: string | null
          id: string
          name: string
          order: number
          project_id: string
          start_date?: string | null
          statut?: Database["public"]["Enums"]["global_status"]
        }
        Update: {
          due_date?: string | null
          end_date?: string | null
          id?: string
          name?: string
          order?: number
          project_id?: string
          start_date?: string | null
          statut?: Database["public"]["Enums"]["global_status"]
        }
        Relationships: [
          {
            foreignKeyName: "steps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          approval_required: boolean
          approver_roles: string[]
          assignee: string | null
          blocking_reason: string | null
          created_at: string
          dependency_task_ids: string[]
          description: string
          due_date: string | null
          id: string
          owner_role: string
          priority: Database["public"]["Enums"]["priority_level"]
          project_id: string
          statut: Database["public"]["Enums"]["global_status"]
          step_id: string
          step_order: number
          title: string
          updated_at: string
        }
        Insert: {
          approval_required?: boolean
          approver_roles?: string[]
          assignee?: string | null
          blocking_reason?: string | null
          created_at?: string
          dependency_task_ids?: string[]
          description?: string
          due_date?: string | null
          id: string
          owner_role?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          project_id: string
          statut?: Database["public"]["Enums"]["global_status"]
          step_id: string
          step_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          approval_required?: boolean
          approver_roles?: string[]
          assignee?: string | null
          blocking_reason?: string | null
          created_at?: string
          dependency_task_ids?: string[]
          description?: string
          due_date?: string | null
          id?: string
          owner_role?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          project_id?: string
          statut?: Database["public"]["Enums"]["global_status"]
          step_id?: string
          step_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_color: string
          avatar_initials: string
          email: string
          id: string
          name: string
          role: string
        }
        Insert: {
          avatar_color?: string
          avatar_initials?: string
          email: string
          id: string
          name: string
          role: string
        }
        Update: {
          avatar_color?: string
          avatar_initials?: string
          email?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      approval_decision: "Pending" | "Approved" | "Rejected"
      approval_object_type: "Task" | "Document" | "Step" | "Project"
      batch_status:
        | "Planned"
        | "Manufactured"
        | "Packaged"
        | "InStability"
        | "Closed"
      document_status: "Draft" | "InReview" | "Approved" | "Rejected"
      document_type:
        | "fiche_technique"
        | "dossier_pre_soumission"
        | "BAT"
        | "programme_importation"
        | "commande_intrants"
        | "reception_liberation"
        | "change_control"
        | "doc_validation"
        | "planning_lots"
        | "dossier_lot"
        | "rapport_QC"
        | "rapport_stabilite"
        | "modules_qualite_AMM"
        | "DE"
        | "autres"
      global_status:
        | "Draft"
        | "Ready"
        | "InProgress"
        | "Blocked"
        | "InReview"
        | "Approved"
        | "Done"
        | "Rework"
        | "Cancelled"
      priority_level: "Low" | "Med" | "High"
      product_type: "pharma" | "cosmetique" | "DM" | "autre"
      project_status:
        | "Initiated"
        | "Running"
        | "Blocked"
        | "ReadyForSubmission"
        | "Submitted"
        | "Closed"
      stability_timepoint: "T0" | "T3" | "T6" | "T9" | "T12" | "Custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_decision: ["Pending", "Approved", "Rejected"],
      approval_object_type: ["Task", "Document", "Step", "Project"],
      batch_status: [
        "Planned",
        "Manufactured",
        "Packaged",
        "InStability",
        "Closed",
      ],
      document_status: ["Draft", "InReview", "Approved", "Rejected"],
      document_type: [
        "fiche_technique",
        "dossier_pre_soumission",
        "BAT",
        "programme_importation",
        "commande_intrants",
        "reception_liberation",
        "change_control",
        "doc_validation",
        "planning_lots",
        "dossier_lot",
        "rapport_QC",
        "rapport_stabilite",
        "modules_qualite_AMM",
        "DE",
        "autres",
      ],
      global_status: [
        "Draft",
        "Ready",
        "InProgress",
        "Blocked",
        "InReview",
        "Approved",
        "Done",
        "Rework",
        "Cancelled",
      ],
      priority_level: ["Low", "Med", "High"],
      product_type: ["pharma", "cosmetique", "DM", "autre"],
      project_status: [
        "Initiated",
        "Running",
        "Blocked",
        "ReadyForSubmission",
        "Submitted",
        "Closed",
      ],
      stability_timepoint: ["T0", "T3", "T6", "T9", "T12", "Custom"],
    },
  },
} as const
