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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ab_test_results: {
        Row: {
          ab_test_id: string
          assigned_at: string
          clicked: boolean | null
          clicked_at: string | null
          converted: boolean | null
          converted_at: string | null
          created_at: string
          customer_id: string
          id: string
          message_sent: boolean | null
          message_sent_at: string | null
          opened: boolean | null
          opened_at: string | null
          replied: boolean | null
          replied_at: string | null
          revenue: number | null
          updated_at: string
          variation_id: string
        }
        Insert: {
          ab_test_id: string
          assigned_at?: string
          clicked?: boolean | null
          clicked_at?: string | null
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          customer_id: string
          id?: string
          message_sent?: boolean | null
          message_sent_at?: string | null
          opened?: boolean | null
          opened_at?: string | null
          replied?: boolean | null
          replied_at?: string | null
          revenue?: number | null
          updated_at?: string
          variation_id: string
        }
        Update: {
          ab_test_id?: string
          assigned_at?: string
          clicked?: boolean | null
          clicked_at?: string | null
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          message_sent?: boolean | null
          message_sent_at?: string | null
          opened?: boolean | null
          opened_at?: string | null
          replied?: boolean | null
          replied_at?: string | null
          revenue?: number | null
          updated_at?: string
          variation_id?: string
        }
        Relationships: []
      }
      ab_test_variations: {
        Row: {
          ab_test_id: string
          audience_count: number | null
          clicked_count: number | null
          conversion_count: number | null
          conversion_rate: number | null
          created_at: string
          ctr: number | null
          id: string
          is_winner: boolean | null
          message_template: string
          opened_count: number | null
          read_count: number | null
          reply_count: number | null
          sent_count: number | null
          traffic_allocation: number | null
          updated_at: string
          variation_name: string
        }
        Insert: {
          ab_test_id: string
          audience_count?: number | null
          clicked_count?: number | null
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          ctr?: number | null
          id?: string
          is_winner?: boolean | null
          message_template: string
          opened_count?: number | null
          read_count?: number | null
          reply_count?: number | null
          sent_count?: number | null
          traffic_allocation?: number | null
          updated_at?: string
          variation_name: string
        }
        Update: {
          ab_test_id?: string
          audience_count?: number | null
          clicked_count?: number | null
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          ctr?: number | null
          id?: string
          is_winner?: boolean | null
          message_template?: string
          opened_count?: number | null
          read_count?: number | null
          reply_count?: number | null
          sent_count?: number | null
          traffic_allocation?: number | null
          updated_at?: string
          variation_name?: string
        }
        Relationships: []
      }
      ab_tests: {
        Row: {
          campaign_id: string
          completed_at: string | null
          confidence_level: number | null
          created_at: string
          customer_count: number | null
          id: string
          name: string
          product_details_id: string | null
          started_at: string | null
          status: string
          target_audience: string | null
          traffic_split: number
          updated_at: string
          winner_variation: string | null
        }
        Insert: {
          campaign_id: string
          completed_at?: string | null
          confidence_level?: number | null
          created_at?: string
          customer_count?: number | null
          id?: string
          name: string
          product_details_id?: string | null
          started_at?: string | null
          status?: string
          target_audience?: string | null
          traffic_split?: number
          updated_at?: string
          winner_variation?: string | null
        }
        Update: {
          campaign_id?: string
          completed_at?: string | null
          confidence_level?: number | null
          created_at?: string
          customer_count?: number | null
          id?: string
          name?: string
          product_details_id?: string | null
          started_at?: string | null
          status?: string
          target_audience?: string | null
          traffic_split?: number
          updated_at?: string
          winner_variation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_product_details_id_fkey"
            columns: ["product_details_id"]
            isOneToOne: false
            referencedRelation: "product_details"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_cache: {
        Row: {
          cache_key: string
          created_at: string
          data: Json
          expires_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          data: Json
          expires_at: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_logs: {
        Row: {
          campaign_name: string
          channel: string
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          delivery_id: string | null
          error_message: string | null
          id: string
          message_content: string
          recipient_email: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_name: string
          channel: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          delivery_id?: string | null
          error_message?: string | null
          id?: string
          message_content: string
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_name?: string
          channel?: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          delivery_id?: string | null
          error_message?: string | null
          id?: string
          message_content?: string
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_metrics: {
        Row: {
          campaign_id: string | null
          clicked_count: number | null
          conversion_count: number | null
          delivered_count: number | null
          id: string
          opened_count: number | null
          sent_count: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_count?: number | null
          conversion_count?: number | null
          delivered_count?: number | null
          id?: string
          opened_count?: number | null
          sent_count?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_count?: number | null
          conversion_count?: number | null
          delivered_count?: number | null
          id?: string
          opened_count?: number | null
          sent_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ai_optimization: boolean
          audience_count: number | null
          clicked_count: number | null
          created_at: string
          ctr: number | null
          end_date: string | null
          id: string
          message_template: string
          name: string
          opened_count: number | null
          roi: number | null
          schedule_type: string
          scheduled_time: string | null
          sent_count: number | null
          start_date: string | null
          status: string
          target_audience: string
          total_cost: number | null
          total_revenue: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_optimization?: boolean
          audience_count?: number | null
          clicked_count?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          message_template: string
          name: string
          opened_count?: number | null
          roi?: number | null
          schedule_type?: string
          scheduled_time?: string | null
          sent_count?: number | null
          start_date?: string | null
          status?: string
          target_audience: string
          total_cost?: number | null
          total_revenue?: number | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_optimization?: boolean
          audience_count?: number | null
          clicked_count?: number | null
          created_at?: string
          ctr?: number | null
          end_date?: string | null
          id?: string
          message_template?: string
          name?: string
          opened_count?: number | null
          roi?: number | null
          schedule_type?: string
          scheduled_time?: string | null
          sent_count?: number | null
          start_date?: string | null
          status?: string
          target_audience?: string
          total_cost?: number | null
          total_revenue?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string
          segment: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone: string
          segment?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string
          segment?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          accepted_cmp1: boolean | null
          accepted_cmp2: boolean | null
          accepted_cmp3: boolean | null
          accepted_cmp4: boolean | null
          accepted_cmp5: boolean | null
          age: number | null
          campaigns_accepted: number | null
          city: string | null
          complain: boolean | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          income: number | null
          kidhome: number | null
          location: string
          mnt_fruits: number | null
          mnt_gold_prods: number | null
          mnt_meat_products: number | null
          mnt_wines: number | null
          num_catalog_purchases: number | null
          num_store_purchases: number | null
          num_web_purchases: number | null
          num_web_visits_month: number | null
          opt_out: boolean | null
          phone: string
          recency: number | null
          response: boolean | null
          teenhome: number | null
          total_purchases: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
          z_cost_contact: number | null
          z_revenue: number | null
        }
        Insert: {
          accepted_cmp1?: boolean | null
          accepted_cmp2?: boolean | null
          accepted_cmp3?: boolean | null
          accepted_cmp4?: boolean | null
          accepted_cmp5?: boolean | null
          age?: number | null
          campaigns_accepted?: number | null
          city?: string | null
          complain?: boolean | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          income?: number | null
          kidhome?: number | null
          location: string
          mnt_fruits?: number | null
          mnt_gold_prods?: number | null
          mnt_meat_products?: number | null
          mnt_wines?: number | null
          num_catalog_purchases?: number | null
          num_store_purchases?: number | null
          num_web_purchases?: number | null
          num_web_visits_month?: number | null
          opt_out?: boolean | null
          phone: string
          recency?: number | null
          response?: boolean | null
          teenhome?: number | null
          total_purchases?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
          z_cost_contact?: number | null
          z_revenue?: number | null
        }
        Update: {
          accepted_cmp1?: boolean | null
          accepted_cmp2?: boolean | null
          accepted_cmp3?: boolean | null
          accepted_cmp4?: boolean | null
          accepted_cmp5?: boolean | null
          age?: number | null
          campaigns_accepted?: number | null
          city?: string | null
          complain?: boolean | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          income?: number | null
          kidhome?: number | null
          location?: string
          mnt_fruits?: number | null
          mnt_gold_prods?: number | null
          mnt_meat_products?: number | null
          mnt_wines?: number | null
          num_catalog_purchases?: number | null
          num_store_purchases?: number | null
          num_web_purchases?: number | null
          num_web_visits_month?: number | null
          opt_out?: boolean | null
          phone?: string
          recency?: number | null
          response?: boolean | null
          teenhome?: number | null
          total_purchases?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
          z_cost_contact?: number | null
          z_revenue?: number | null
        }
        Relationships: []
      }
      product_details: {
        Row: {
          benefits: string | null
          campaign_id: string | null
          created_at: string
          description: string | null
          features: string | null
          id: string
          name: string
          offer: string | null
          price: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          benefits?: string | null
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          features?: string | null
          id?: string
          name: string
          offer?: string | null
          price?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          benefits?: string | null
          campaign_id?: string | null
          created_at?: string
          description?: string | null
          features?: string | null
          id?: string
          name?: string
          offer?: string | null
          price?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_campaign_analytics: {
        Args: { user_uuid: string }
        Returns: Json
      }
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
