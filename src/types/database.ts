/**
 * Supabase schema types. Regenerate after migrations:
 * pnpm db:types
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type EmptyRelationships = [];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          avatar_variant: string | null;
          onboarding_completed: boolean;
          learner_types: string[];
          learning_interests: string[];
          lesson_language: string | null;
          lesson_length: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          avatar_variant?: string | null;
          onboarding_completed?: boolean;
          learner_types?: string[];
          learning_interests?: string[];
          lesson_language?: string | null;
          lesson_length?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      learning_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          topic: string;
          goal: string;
          learner_level: string;
          search_type: string;
          status: string;
          summary: string;
          learning_objectives: Json;
          quiz_questions: Json;
          grounding: Json;
          raw_content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          topic: string;
          goal: string;
          learner_level: string;
          search_type: string;
          status?: string;
          summary: string;
          learning_objectives?: Json;
          quiz_questions?: Json;
          grounding?: Json;
          raw_content?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["learning_sessions"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      session_modules: {
        Row: {
          id: number;
          session_id: string;
          position: number;
          title: string;
          description: string;
          duration: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: string;
          position: number;
          title: string;
          description: string;
          duration?: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_modules"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      session_sources: {
        Row: {
          id: number;
          session_id: string;
          title: string | null;
          url: string;
          highlights: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: string;
          title?: string | null;
          url: string;
          highlights?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_sources"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      session_slides: {
        Row: {
          id: number;
          module_id: number;
          position: number;
          title: string;
          explanation_text: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          module_id: number;
          position: number;
          title: string;
          explanation_text: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_slides"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      session_slide_points: {
        Row: {
          id: number;
          slide_id: number;
          position: number;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          slide_id: number;
          position: number;
          text: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_slide_points"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
      session_module_key_points: {
        Row: {
          id: number;
          module_id: number;
          position: number;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          module_id: number;
          position: number;
          text: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_module_key_points"]["Insert"]>;
        Relationships: EmptyRelationships;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Course row — `learning_sessions.id` is the course id */
export type CourseRow = Database["public"]["Tables"]["learning_sessions"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
