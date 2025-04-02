export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
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
          title: string
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
      goals: {
        Row: {
          completed: boolean
          created_at: string
          description: string | null
          id: string
          image_loading: boolean | null
          image_url: string | null
          target_date: string | null
          task_summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_loading?: boolean | null
          image_url?: string | null
          target_date?: string | null
          task_summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_loading?: boolean | null
          image_url?: string | null
          target_date?: string | null
          task_summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          questions: Json
          task_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          questions?: Json
          task_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          questions?: Json
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          active: boolean
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          article_content: string | null
          completed: boolean
          created_at: string
          description: string | null
          goal_id: string
          id: string
          order_number: number
          title: string
        }
        Insert: {
          article_content?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          order_number: number
          title: string
        }
        Update: {
          article_content?: string | null
          completed?: boolean
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          order_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          date: string
          goals_created: number
          id: string
          messages_sent: number
          user_id: string
        }
        Insert: {
          date?: string
          goals_created?: number
          id?: string
          messages_sent?: number
          user_id: string
        }
        Update: {
          date?: string
          goals_created?: number
          id?: string
          messages_sent?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_role_to_user: {
        Args: {
          target_user_id: string
          target_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      bootstrap_admin: {
        Args: {
          admin_email: string
        }
        Returns: undefined
      }
      check_goal_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_message_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          created_at: string
          roles: Json
        }[]
      }
      get_user_plan: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["subscription_plan"]
      }
      get_user_usage_and_limits: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_usage: {
        Args: {
          usage_type: string
        }
        Returns: undefined
      }
      remove_role_from_user: {
        Args: {
          target_user_id: string
          target_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
      update_goal_image_loading: {
        Args: {
          goal_id: string
          is_loading: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      subscription_plan: "free" | "monthly" | "annual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
