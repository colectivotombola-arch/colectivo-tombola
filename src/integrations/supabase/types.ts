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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bingo_games: {
        Row: {
          called_numbers: number[] | null
          created_at: string | null
          entry_fee: number | null
          id: string
          instagram_stream_key: string | null
          is_streaming: boolean | null
          max_players: number | null
          name: string
          prize_pool: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          called_numbers?: number[] | null
          created_at?: string | null
          entry_fee?: number | null
          id?: string
          instagram_stream_key?: string | null
          is_streaming?: boolean | null
          max_players?: number | null
          name: string
          prize_pool?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          called_numbers?: number[] | null
          created_at?: string | null
          entry_fee?: number | null
          id?: string
          instagram_stream_key?: string | null
          is_streaming?: boolean | null
          max_players?: number | null
          name?: string
          prize_pool?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      lottery_draws: {
        Row: {
          bonus_max_number: number
          bonus_number: number | null
          created_at: string
          draw_date: string
          id: string
          jackpot_amount: number
          max_number: number
          name: string
          numbers_to_select: number
          status: string
          ticket_price: number
          total_tickets_sold: number | null
          updated_at: string
          winning_numbers: number[] | null
        }
        Insert: {
          bonus_max_number?: number
          bonus_number?: number | null
          created_at?: string
          draw_date: string
          id?: string
          jackpot_amount: number
          max_number?: number
          name: string
          numbers_to_select?: number
          status?: string
          ticket_price?: number
          total_tickets_sold?: number | null
          updated_at?: string
          winning_numbers?: number[] | null
        }
        Update: {
          bonus_max_number?: number
          bonus_number?: number | null
          created_at?: string
          draw_date?: string
          id?: string
          jackpot_amount?: number
          max_number?: number
          name?: string
          numbers_to_select?: number
          status?: string
          ticket_price?: number
          total_tickets_sold?: number | null
          updated_at?: string
          winning_numbers?: number[] | null
        }
        Relationships: []
      }
      lottery_packages: {
        Row: {
          created_at: string
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          position: number
          price: number
          ticket_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          position?: number
          price: number
          ticket_count: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          position?: number
          price?: number
          ticket_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      lottery_tickets: {
        Row: {
          bonus_number: number | null
          buyer_email: string
          buyer_name: string
          buyer_phone: string | null
          created_at: string
          draw_id: string
          id: string
          numbers: number[]
          payment_id: string | null
          payment_status: string
          purchase_amount: number
          purchased_at: string
          ticket_number: string
        }
        Insert: {
          bonus_number?: number | null
          buyer_email: string
          buyer_name: string
          buyer_phone?: string | null
          created_at?: string
          draw_id: string
          id?: string
          numbers: number[]
          payment_id?: string | null
          payment_status?: string
          purchase_amount: number
          purchased_at?: string
          ticket_number: string
        }
        Update: {
          bonus_number?: number | null
          buyer_email?: string
          buyer_name?: string
          buyer_phone?: string | null
          created_at?: string
          draw_id?: string
          id?: string
          numbers?: number[]
          payment_id?: string | null
          payment_status?: string
          purchase_amount?: number
          purchased_at?: string
          ticket_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_tickets_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "lottery_draws"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_winners: {
        Row: {
          category_id: string
          claimed_at: string | null
          created_at: string
          draw_id: string
          id: string
          is_claimed: boolean | null
          prize_amount: number
          ticket_id: string
          winner_name: string
        }
        Insert: {
          category_id: string
          claimed_at?: string | null
          created_at?: string
          draw_id: string
          id?: string
          is_claimed?: boolean | null
          prize_amount: number
          ticket_id: string
          winner_name: string
        }
        Update: {
          category_id?: string
          claimed_at?: string | null
          created_at?: string
          draw_id?: string
          id?: string
          is_claimed?: boolean | null
          prize_amount?: number
          ticket_id?: string
          winner_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lottery_winners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "prize_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_winners_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "lottery_draws"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_winners_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "lottery_tickets"
            referencedColumns: ["id"]
          },
        ]
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
      prize_categories: {
        Row: {
          bonus_required: boolean | null
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          match_count: number
          name: string
          odds_denominator: number
          position: number
          prize_amount: number | null
          prize_percentage: number | null
          updated_at: string
        }
        Insert: {
          bonus_required?: boolean | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          match_count: number
          name: string
          odds_denominator: number
          position?: number
          prize_amount?: number | null
          prize_percentage?: number | null
          updated_at?: string
        }
        Update: {
          bonus_required?: boolean | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          match_count?: number
          name?: string
          odds_denominator?: number
          position?: number
          prize_amount?: number | null
          prize_percentage?: number | null
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
          is_active: boolean
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
          is_active?: boolean
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
          is_active?: boolean
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
          allow_multiple_purchases: boolean | null
          created_at: string
          created_by: string | null
          description: string
          draw_date: string | null
          end_date: string | null
          id: string
          instant_prizes: Json | null
          is_sold_out: boolean | null
          max_tickets_per_purchase: number | null
          min_tickets_per_purchase: number | null
          numbers_sold: number | null
          price_per_number: number
          prize_image: string | null
          purchase_limit: number | null
          sold_percentage: number | null
          start_date: string | null
          status: string
          title: string
          total_numbers: number
          updated_at: string
          winner_number: number | null
        }
        Insert: {
          allow_multiple_purchases?: boolean | null
          created_at?: string
          created_by?: string | null
          description: string
          draw_date?: string | null
          end_date?: string | null
          id?: string
          instant_prizes?: Json | null
          is_sold_out?: boolean | null
          max_tickets_per_purchase?: number | null
          min_tickets_per_purchase?: number | null
          numbers_sold?: number | null
          price_per_number?: number
          prize_image?: string | null
          purchase_limit?: number | null
          sold_percentage?: number | null
          start_date?: string | null
          status?: string
          title: string
          total_numbers?: number
          updated_at?: string
          winner_number?: number | null
        }
        Update: {
          allow_multiple_purchases?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string
          draw_date?: string | null
          end_date?: string | null
          id?: string
          instant_prizes?: Json | null
          is_sold_out?: boolean | null
          max_tickets_per_purchase?: number | null
          min_tickets_per_purchase?: number | null
          numbers_sold?: number | null
          price_per_number?: number
          prize_image?: string | null
          purchase_limit?: number | null
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
          activity_title: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          email_settings: Json | null
          hero_subtitle: string
          hero_title: string
          id: string
          instagram_display_name: string | null
          instagram_handle: string | null
          instagram_video_url: string | null
          logo_url: string | null
          payment_settings: Json | null
          price_per_number: string | null
          primary_color: string
          purchase_rules: string | null
          raffle_rules: string | null
          secondary_color: string
          site_name: string
          site_tagline: string | null
          social_media: Json | null
          terms_and_conditions: string | null
          updated_at: string
          whatsapp_datalinks: Json | null
          whatsapp_number: string | null
        }
        Insert: {
          activity_title?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          email_settings?: Json | null
          hero_subtitle?: string
          hero_title?: string
          id?: string
          instagram_display_name?: string | null
          instagram_handle?: string | null
          instagram_video_url?: string | null
          logo_url?: string | null
          payment_settings?: Json | null
          price_per_number?: string | null
          primary_color?: string
          purchase_rules?: string | null
          raffle_rules?: string | null
          secondary_color?: string
          site_name?: string
          site_tagline?: string | null
          social_media?: Json | null
          terms_and_conditions?: string | null
          updated_at?: string
          whatsapp_datalinks?: Json | null
          whatsapp_number?: string | null
        }
        Update: {
          activity_title?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          email_settings?: Json | null
          hero_subtitle?: string
          hero_title?: string
          id?: string
          instagram_display_name?: string | null
          instagram_handle?: string | null
          instagram_video_url?: string | null
          logo_url?: string | null
          payment_settings?: Json | null
          price_per_number?: string | null
          primary_color?: string
          purchase_rules?: string | null
          raffle_rules?: string | null
          secondary_color?: string
          site_name?: string
          site_tagline?: string | null
          social_media?: Json | null
          terms_and_conditions?: string | null
          updated_at?: string
          whatsapp_datalinks?: Json | null
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
      winners: {
        Row: {
          created_at: string
          date_won: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          position: number
          prize: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_won: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          position?: number
          prize: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_won?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          position?: number
          prize?: string
          updated_at?: string
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
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_public_site_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          activity_title: string
          created_at: string
          hero_subtitle: string
          hero_title: string
          id: string
          instagram_display_name: string
          instagram_handle: string
          instagram_video_url: string
          logo_url: string
          price_per_number: string
          primary_color: string
          purchase_rules: string
          secondary_color: string
          site_name: string
          site_tagline: string
          terms_and_conditions: string
          updated_at: string
          whatsapp_number: string
        }[]
      }
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
