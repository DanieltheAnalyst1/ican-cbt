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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      exam_attempts: {
        Row: {
          answers: Json
          created_at: string
          exam_id: string
          id: string
          score: number | null
          started_at: string
          submitted_at: string | null
          time_spent_seconds: number | null
          total_marks: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          exam_id: string
          id?: string
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          time_spent_seconds?: number | null
          total_marks?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          exam_id?: string
          id?: string
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          time_spent_seconds?: number | null
          total_marks?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_sections: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          instructions: string | null
          is_compulsory: boolean
          label: string
          required_questions: number
          sort_order: number
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          instructions?: string | null
          is_compulsory?: boolean
          label: string
          required_questions?: number
          sort_order?: number
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          instructions?: string | null
          is_compulsory?: boolean
          label?: string
          required_questions?: number
          sort_order?: number
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_sections_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          created_by: string | null
          duration_minutes: number
          id: string
          instructions: string | null
          published: boolean
          subject: string
          title: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          id?: string
          instructions?: string | null
          published?: boolean
          subject: string
          title: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          id?: string
          instructions?: string | null
          published?: boolean
          subject?: string
          title?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string
          exam_id: string
          financial_tables: Json | null
          id: string
          images: Json | null
          question_number: number
          required: string
          scenario: string
          section_id: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          financial_tables?: Json | null
          id?: string
          images?: Json | null
          question_number: number
          required?: string
          scenario?: string
          section_id?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          financial_tables?: Json | null
          id?: string
          images?: Json | null
          question_number?: number
          required?: string
          scenario?: string
          section_id?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "exam_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_questions: {
        Row: {
          created_at: string
          hints: Json | null
          id: string
          key_points: Json | null
          label: string
          marks: number
          model_answer: string | null
          question_id: string
          sort_order: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hints?: Json | null
          id?: string
          key_points?: Json | null
          label: string
          marks?: number
          model_answer?: string | null
          question_id: string
          sort_order?: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hints?: Json | null
          id?: string
          key_points?: Json | null
          label?: string
          marks?: number
          model_answer?: string | null
          question_id?: string
          sort_order?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          amount_paid: number
          created_at: string
          id: string
          payment_reference: string | null
          total_attempts: number
          updated_at: string
          used_attempts: number
          user_id: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          id?: string
          payment_reference?: string | null
          total_attempts?: number
          updated_at?: string
          used_attempts?: number
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          id?: string
          payment_reference?: string | null
          total_attempts?: number
          updated_at?: string
          used_attempts?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
