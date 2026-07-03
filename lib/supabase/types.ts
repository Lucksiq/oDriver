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
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          liters: number | null
          occurred_at: string
          price_per_liter: number | null
          subcategory: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          liters?: number | null
          occurred_at?: string
          price_per_liter?: number | null
          subcategory?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          liters?: number | null
          occurred_at?: string
          price_per_liter?: number | null
          subcategory?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_earnings: {
        Row: {
          amount: number
          category: string
          description: string | null
          id: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          description?: string | null
          id?: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          description?: string | null
          id?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extra_earnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_earnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          achieved: boolean
          achieved_at: string | null
          amount: number
          created_at: string
          id: string
          period_end: string
          period_start: string
          type: string
          user_id: string
        }
        Insert: {
          achieved?: boolean
          achieved_at?: string | null
          amount: number
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          type: string
          user_id: string
        }
        Update: {
          achieved?: boolean
          achieved_at?: string | null
          amount?: number
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      map_reports: {
        Row: {
          active: boolean
          city: string | null
          confirmations: number
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          type: string
          user_id: string
        }
        Insert: {
          active?: boolean
          city?: string | null
          confirmations?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          type: string
          user_id: string
        }
        Update: {
          active?: boolean
          city?: string | null
          confirmations?: number
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "map_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "map_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          daily_goal: number
          display_name: string | null
          id: string
          is_admin: boolean
          is_premium: boolean
          monthly_goal: number
          onboarding_complete: boolean
          platforms: string[]
          premium_until: string | null
          show_earnings_public: boolean
          state: string | null
          username: string | null
          weekly_goal: number
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          daily_goal?: number
          display_name?: string | null
          id: string
          is_admin?: boolean
          is_premium?: boolean
          monthly_goal?: number
          onboarding_complete?: boolean
          platforms?: string[]
          premium_until?: string | null
          show_earnings_public?: boolean
          state?: string | null
          username?: string | null
          weekly_goal?: number
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          daily_goal?: number
          display_name?: string | null
          id?: string
          is_admin?: boolean
          is_premium?: boolean
          monthly_goal?: number
          onboarding_complete?: boolean
          platforms?: string[]
          premium_until?: string | null
          show_earnings_public?: boolean
          state?: string | null
          username?: string | null
          weekly_goal?: number
        }
        Relationships: []
      }
      rides: {
        Row: {
          amount: number
          created_at: string
          distance_km: number | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          notes: string | null
          platform: string
          rating: number | null
          ride_type: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          platform: string
          rating?: number | null
          ride_type?: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          platform?: string
          rating?: number | null
          ride_type?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_user_stats: {
        Row: {
          city: string | null
          created_at: string | null
          display_name: string | null
          gross_earnings: number | null
          id: string | null
          is_admin: boolean | null
          is_premium: boolean | null
          onboarding_complete: boolean | null
          platforms: string[] | null
          ride_count: number | null
          state: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      confirm_map_report: { Args: { report_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
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
