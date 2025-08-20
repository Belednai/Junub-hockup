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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          diff_json: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          diff_json?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          diff_json?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          enabled: boolean | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      fx_auction_notices: {
        Row: {
          body: string | null
          created_at: string | null
          created_by: string | null
          document_urls: string[] | null
          eligibility_notes: string | null
          id: string
          scheduled_at: string
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          document_urls?: string[] | null
          eligibility_notes?: string | null
          id?: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          created_by?: string | null
          document_urls?: string[] | null
          eligibility_notes?: string | null
          id?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fx_auction_results: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_urls: string[] | null
          id: string
          notice_id: string | null
          published_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_urls?: string[] | null
          id?: string
          notice_id?: string | null
          published_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_urls?: string[] | null
          id?: string
          notice_id?: string | null
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fx_auction_results_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "fx_auction_notices"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          buy_rate: number
          created_at: string | null
          currency_id: string
          effective_date: string
          id: string
          published_at: string | null
          published_by: string | null
          sell_rate: number
        }
        Insert: {
          buy_rate: number
          created_at?: string | null
          currency_id: string
          effective_date: string
          id?: string
          published_at?: string | null
          published_by?: string | null
          sell_rate: number
        }
        Update: {
          buy_rate?: number
          created_at?: string | null
          currency_id?: string
          effective_date?: string
          id?: string
          published_at?: string | null
          published_by?: string | null
          sell_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "fx_rates_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string | null
          created_by: string | null
          id: string
          last_reviewed_at: string | null
          license_status: string | null
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["institution_type"]
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_reviewed_at?: string | null
          license_status?: string | null
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["institution_type"]
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_reviewed_at?: string | null
          license_status?: string | null
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["institution_type"]
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      leaders: {
        Row: {
          bio: string | null
          created_at: string | null
          created_by: string | null
          group_type: Database["public"]["Enums"]["leader_group"]
          id: string
          name: string
          photo_url: string | null
          priority: number | null
          role_title: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          group_type: Database["public"]["Enums"]["leader_group"]
          id?: string
          name: string
          photo_url?: string | null
          priority?: number | null
          role_title: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          created_by?: string | null
          group_type?: Database["public"]["Enums"]["leader_group"]
          id?: string
          name?: string
          photo_url?: string | null
          priority?: number | null
          role_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string | null
          created_by: string | null
          credit: string | null
          id: string
          metadata: Json | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          created_by?: string | null
          credit?: string | null
          id?: string
          metadata?: Json | null
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          created_by?: string | null
          credit?: string | null
          id?: string
          metadata?: Json | null
          url?: string
        }
        Relationships: []
      }
      news_items: {
        Row: {
          body: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: Database["public"]["Enums"]["news_type"]
          updated_at: string | null
        }
        Insert: {
          body?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          type: Database["public"]["Enums"]["news_type"]
          updated_at?: string | null
        }
        Update: {
          body?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["news_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "user_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "user_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string
          id: string
          post_id: string
          shared_with_caption: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          shared_with_caption?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          shared_with_caption?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "user_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          author: string | null
          category: Database["public"]["Enums"]["publication_category"]
          created_at: string | null
          created_by: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"] | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          author?: string | null
          category: Database["public"]["Enums"]["publication_category"]
          created_at?: string | null
          created_by?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"] | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          author?: string | null
          category?: Database["public"]["Enums"]["publication_category"]
          created_at?: string | null
          created_by?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"] | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value_json: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value_json?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value_json?: Json | null
        }
        Relationships: []
      }
      tbill_schedules: {
        Row: {
          closes_at: string
          created_at: string | null
          created_by: string | null
          id: string
          opens_at: string
          result_document_url: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          closes_at: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          opens_at: string
          result_document_url?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          closes_at?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          opens_at?: string
          result_document_url?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      user_posts: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          caption: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          caption: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          caption?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "admin" | "editor" | "economist" | "communications"
      content_status: "draft" | "pending" | "published" | "archived"
      institution_type: "bank" | "forex_bureau"
      leader_group: "board" | "management"
      news_type: "news" | "press" | "governor"
      publication_category:
        | "financial_statements"
        | "acts"
        | "regulations"
        | "circulars"
        | "statistical_bulletins"
        | "inflation"
        | "balance_of_payments"
        | "monetary_statistics"
        | "monetary_policy"
        | "monetary_analysis"
        | "publications"
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
      app_role: ["admin", "editor", "economist", "communications"],
      content_status: ["draft", "pending", "published", "archived"],
      institution_type: ["bank", "forex_bureau"],
      leader_group: ["board", "management"],
      news_type: ["news", "press", "governor"],
      publication_category: [
        "financial_statements",
        "acts",
        "regulations",
        "circulars",
        "statistical_bulletins",
        "inflation",
        "balance_of_payments",
        "monetary_statistics",
        "monetary_policy",
        "monetary_analysis",
        "publications",
      ],
    },
  },
} as const
