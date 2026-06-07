/**
 * Supabase schema types. Regenerate after migrations:
 * pnpm db:types
 */
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      learning_sessions: {
        Row: {
          created_at: string
          goal: string
          grounding: Json
          id: string
          learner_level: string
          learning_objectives: Json
          quiz_questions: Json
          raw_content: Json
          search_type: string
          status: string
          summary: string
          topic: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          goal: string
          grounding?: Json
          id?: string
          learner_level: string
          learning_objectives?: Json
          quiz_questions?: Json
          raw_content?: Json
          search_type: string
          status?: string
          summary: string
          topic: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          goal?: string
          grounding?: Json
          id?: string
          learner_level?: string
          learning_objectives?: Json
          quiz_questions?: Json
          raw_content?: Json
          search_type?: string
          status?: string
          summary?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          avatar_variant: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          learner_types: string[]
          learning_interests: string[]
          lesson_language: string
          lesson_length: string
          onboarding_completed: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          avatar_variant?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          learner_types?: string[]
          learning_interests?: string[]
          lesson_language?: string
          lesson_length?: string
          onboarding_completed?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          avatar_variant?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          learner_types?: string[]
          learning_interests?: string[]
          lesson_language?: string
          lesson_length?: string
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      session_module_key_points: {
        Row: {
          created_at: string
          id: number
          module_id: number
          position: number
          text: string
        }
        Insert: {
          created_at?: string
          id?: never
          module_id: number
          position: number
          text: string
        }
        Update: {
          created_at?: string
          id?: never
          module_id?: number
          position?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_module_key_points_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "session_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      session_modules: {
        Row: {
          completed: boolean
          created_at: string
          description: string
          duration: string
          id: number
          position: number
          session_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description: string
          duration?: string
          id?: never
          position: number
          session_id: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string
          duration?: string
          id?: never
          position?: number
          session_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_modules_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_slide_points: {
        Row: {
          created_at: string
          id: number
          position: number
          slide_id: number
          text: string
        }
        Insert: {
          created_at?: string
          id?: never
          position: number
          slide_id: number
          text: string
        }
        Update: {
          created_at?: string
          id?: never
          position?: number
          slide_id?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_slide_points_slide_id_fkey"
            columns: ["slide_id"]
            isOneToOne: false
            referencedRelation: "session_slides"
            referencedColumns: ["id"]
          },
        ]
      }
      session_slides: {
        Row: {
          audio_url: string | null
          created_at: string
          diagram_query: string | null
          explanation_text: string
          id: number
          layout: string | null
          module_id: number
          position: number
          title: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          diagram_query?: string | null
          explanation_text: string
          id?: never
          layout?: string | null
          module_id: number
          position: number
          title: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          diagram_query?: string | null
          explanation_text?: string
          id?: never
          layout?: string | null
          module_id?: number
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_slides_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "session_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      session_sources: {
        Row: {
          created_at: string
          highlights: Json
          id: number
          session_id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          highlights?: Json
          id?: never
          session_id: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          highlights?: Json
          id?: never
          session_id?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_sources_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "learning_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
