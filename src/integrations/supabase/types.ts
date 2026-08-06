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
      challenge_attempts: {
        Row: {
          awarded_xp: number
          challenge_id: string
          created_at: string
          id: string
          output: string
          passed: boolean
          user_id: string
        }
        Insert: {
          awarded_xp?: number
          challenge_id: string
          created_at?: string
          id?: string
          output?: string
          passed?: boolean
          user_id: string
        }
        Update: {
          awarded_xp?: number
          challenge_id?: string
          created_at?: string
          id?: string
          output?: string
          passed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          expected_output: string
          id: string
          lesson_id: string
          match_mode: string
          prompt: string
          starter_command: string | null
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          expected_output?: string
          id?: string
          lesson_id: string
          match_mode?: string
          prompt: string
          starter_command?: string | null
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          expected_output?: string
          id?: string
          lesson_id?: string
          match_mode?: string
          prompt?: string
          starter_command?: string | null
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenges_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          completed_at: string
          lesson_slug: string
          path_slug: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_slug: string
          path_slug: string
          user_id: string
        }
        Update: {
          completed_at?: string
          lesson_slug?: string
          path_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          expected_output: string | null
          id: string
          lesson_type: string
          pdf_url: string | null
          published: boolean
          slug: string
          sort_order: number
          starter_code: string | null
          title: string
          updated_at: string
          video_url: string | null
          xp_reward: number
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          expected_output?: string | null
          id?: string
          lesson_type?: string
          pdf_url?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          starter_code?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
          xp_reward?: number
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          expected_output?: string | null
          id?: string
          lesson_type?: string
          pdf_url?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          starter_code?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      linux_commands: {
        Row: {
          category: string
          common_mistakes: Json
          created_at: string
          description: string
          embedding: string | null
          examples: Json
          name: string
          related: Json
          short_desc: string
          slug: string
          syntax: string
          updated_at: string
        }
        Insert: {
          category: string
          common_mistakes?: Json
          created_at?: string
          description: string
          embedding?: string | null
          examples?: Json
          name: string
          related?: Json
          short_desc: string
          slug: string
          syntax: string
          updated_at?: string
        }
        Update: {
          category?: string
          common_mistakes?: Json
          created_at?: string
          description?: string
          embedding?: string | null
          examples?: Json
          name?: string
          related?: Json
          short_desc?: string
          slug?: string
          syntax?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          href: string | null
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          choices: Json
          correct_index: number
          created_at: string
          explanation: string | null
          id: string
          prompt: string
          quiz_id: string
          sort_order: number
        }
        Insert: {
          choices?: Json
          correct_index?: number
          created_at?: string
          explanation?: string | null
          id?: string
          prompt: string
          quiz_id: string
          sort_order?: number
        }
        Update: {
          choices?: Json
          correct_index?: number
          created_at?: string
          explanation?: string | null
          id?: string
          prompt?: string
          quiz_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          created_at: string
          id: string
          path_slug: string
          quiz_slug: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          path_slug: string
          quiz_slug: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          path_slug?: string
          quiz_slug?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          passing_score: number
          title: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          passing_score?: number
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          passing_score?: number
          title?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      streak_freezes: {
        Row: {
          created_at: string
          delta: number
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta?: number
          id?: string
          reason?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      terminal_sessions: {
        Row: {
          commands_run: number
          created_at: string
          distro: string
          id: string
          last_command: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          commands_run?: number
          created_at?: string
          distro?: string
          id?: string
          last_command?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          commands_run?: number
          created_at?: string
          distro?: string
          id?: string
          last_command?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          last_active_date: string | null
          level: number
          longest_streak: number
          streak_days: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          streak_days?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      weekly_goals: {
        Row: {
          created_at: string
          earned_xp: number
          id: string
          reminders_enabled: boolean
          target_xp: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          earned_xp?: number
          id?: string
          reminders_enabled?: boolean
          target_xp?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          earned_xp?: number
          id?: string
          reminders_enabled?: boolean
          target_xp?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_commands: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          category: string
          description: string
          name: string
          short_desc: string
          similarity: number
          slug: string
          syntax: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "instructor" | "user"
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
      app_role: ["admin", "instructor", "user"],
    },
  },
} as const
