export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      design_settings: {
        Row: {
          border_radius: number | null
          created_at: string | null
          custom_css: string | null
          font_family: string | null
          font_size_base: number | null
          font_size_heading: number | null
          id: string
          theme_mode: string | null
          updated_at: string | null
        }
        Insert: {
          border_radius?: number | null
          created_at?: string | null
          custom_css?: string | null
          font_family?: string | null
          font_size_base?: number | null
          font_size_heading?: number | null
          id?: string
          theme_mode?: string | null
          updated_at?: string | null
        }
        Update: {
          border_radius?: number | null
          created_at?: string | null
          custom_css?: string | null
          font_family?: string | null
          font_size_base?: number | null
          font_size_heading?: number | null
          id?: string
          theme_mode?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dynamic_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      media_gallery: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          media_type: string
          media_url: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          media_type?: string
          media_url: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          media_type?: string
          media_url?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_uploads: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          filename: string
          id: string
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      photo_gallery: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      prize_displays: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          position: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          position?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          position?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      prizes: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          position: number
          raffle_id: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          position?: number
          raffle_id?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          position?: number
          raffle_id?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prizes_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_confirmations: {
        Row: {
          assigned_numbers: number[] | null
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          confirmation_number: string
          created_at: string | null
          id: string
          payment_method: string | null
          quantity: number
          raffle_id: string
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          assigned_numbers?: number[] | null
          buyer_email: string
          buyer_name: string
          buyer_phone: string
          confirmation_number: string
          created_at?: string | null
          id?: string
          payment_method?: string | null
          quantity: number
          raffle_id: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          assigned_numbers?: number[] | null
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string
          confirmation_number?: string
          created_at?: string | null
          id?: string
          payment_method?: string | null
          quantity?: number
          raffle_id?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_confirmations_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_settings: {
        Row: {
          allow_custom_quantity: boolean | null
          created_at: string | null
          email_notifications_enabled: boolean | null
          id: string
          payment_methods: Json | null
          raffle_id: string | null
          terms_and_conditions: string | null
          updated_at: string | null
        }
        Insert: {
          allow_custom_quantity?: boolean | null
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          payment_methods?: Json | null
          raffle_id?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_custom_quantity?: boolean | null
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          payment_methods?: Json | null
          raffle_id?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_settings_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: true
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffle_numbers: {
        Row: {
          buyer_email: string | null
          buyer_name: string
          buyer_phone: string
          created_at: string
          id: string
          number_value: number
          payment_method: string | null
          payment_status: string | null
          purchase_date: string
          raffle_id: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_name: string
          buyer_phone: string
          created_at?: string
          id?: string
          number_value: number
          payment_method?: string | null
          payment_status?: string | null
          purchase_date?: string
          raffle_id: string
        }
        Update: {
          buyer_email?: string | null
          buyer_name?: string
          buyer_phone?: string
          created_at?: string
          id?: string
          number_value?: number
          payment_method?: string | null
          payment_status?: string | null
          purchase_date?: string
          raffle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_numbers_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffle_packages: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_popular: boolean | null
          price_per_ticket: number
          raffle_id: string | null
          ticket_count: number
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_popular?: boolean | null
          price_per_ticket?: number
          raffle_id?: string | null
          ticket_count: number
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_popular?: boolean | null
          price_per_ticket?: number
          raffle_id?: string | null
          ticket_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "raffle_packages_raffle_id_fkey"
            columns: ["raffle_id"]
            isOneToOne: false
            referencedRelation: "raffles"
            referencedColumns: ["id"]
          },
        ]
      }
      raffles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          draw_date: string | null
          end_date: string | null
          id: string
          instant_prizes: Json | null
          max_tickets_per_purchase: number | null
          min_tickets_per_purchase: number | null
          numbers_sold: number | null
          price_per_number: number
          prize_image: string | null
          sold_percentage: number | null
          start_date: string | null
          status: string
          title: string
          total_numbers: number
          updated_at: string
          winner_number: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          draw_date?: string | null
          end_date?: string | null
          id?: string
          instant_prizes?: Json | null
          max_tickets_per_purchase?: number | null
          min_tickets_per_purchase?: number | null
          numbers_sold?: number | null
          price_per_number?: number
          prize_image?: string | null
          sold_percentage?: number | null
          start_date?: string | null
          status?: string
          title: string
          total_numbers?: number
          updated_at?: string
          winner_number?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          draw_date?: string | null
          end_date?: string | null
          id?: string
          instant_prizes?: Json | null
          max_tickets_per_purchase?: number | null
          min_tickets_per_purchase?: number | null
          numbers_sold?: number | null
          price_per_number?: number
          prize_image?: string | null
          sold_percentage?: number | null
          start_date?: string | null
          status?: string
          title?: string
          total_numbers?: number
          updated_at?: string
          winner_number?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          email_settings: Json | null
          hero_subtitle: string
          hero_title: string
          id: string
          instagram_video_url: string | null
          logo_url: string | null
          payment_settings: Json | null
          primary_color: string
          secondary_color: string
          site_name: string
          site_tagline: string | null
          social_media: Json | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          email_settings?: Json | null
          hero_subtitle?: string
          hero_title?: string
          id?: string
          instagram_video_url?: string | null
          logo_url?: string | null
          payment_settings?: Json | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          site_tagline?: string | null
          social_media?: Json | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          email_settings?: Json | null
          hero_subtitle?: string
          hero_title?: string
          id?: string
          instagram_video_url?: string | null
          logo_url?: string | null
          payment_settings?: Json | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          site_tagline?: string | null
          social_media?: Json | null
          updated_at?: string
          whatsapp_number?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_confirmation_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
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
