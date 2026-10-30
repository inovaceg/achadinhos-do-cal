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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          active: boolean
          button_text: string | null
          button_url: string | null
          click_count: number
          created_at: string
          ends_at: string | null
          id: string
          image_desktop: string | null
          image_mobile: string | null
          image_url: string | null
          mobile_image_url: string | null
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          active?: boolean
          button_text?: string | null
          button_url?: string | null
          click_count?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          image_url?: string | null
          mobile_image_url?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          active?: boolean
          button_text?: string | null
          button_url?: string | null
          click_count?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          image_url?: string | null
          mobile_image_url?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      click_events: {
        Row: {
          banner_id: string | null
          created_at: string
          id: number
          product_id: string | null
          visitor_hash: string
        }
        Insert: {
          banner_id?: string | null
          created_at?: string
          id?: never
          product_id?: string | null
          visitor_hash: string
        }
        Update: {
          banner_id?: string | null
          created_at?: string
          id?: never
          product_id?: string | null
          visitor_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "click_events_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "click_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          created_at: string
          id: number
          product_id: string
          visitor_hash: string
        }
        Insert: {
          created_at?: string
          id?: never
          product_id: string
          visitor_hash: string
        }
        Update: {
          created_at?: string
          id?: never
          product_id?: string
          visitor_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          affiliate_url: string | null
          badge: string | null
          best_seller: boolean
          bestseller: boolean
          category_id: string | null
          click_count: number
          created_at: string
          description: string | null
          expires_at: string | null
          external_url: string | null
          featured: boolean
          features: string[]
          id: string
          image_url: string | null
          images: string[]
          main_image: string | null
          name: string
          original_price: number | null
          price: number
          price_updated_at: string
          promo_price: number | null
          recommended: boolean
          slug: string
          store: string | null
          store_id: string | null
          tags: string[]
          updated_at: string
          videos: string[]
          view_count: number
        }
        Insert: {
          active?: boolean
          affiliate_url?: string | null
          badge?: string | null
          best_seller?: boolean
          bestseller?: boolean
          category_id?: string | null
          click_count?: number
          created_at?: string
          description?: string | null
          expires_at?: string | null
          external_url?: string | null
          featured?: boolean
          features?: string[]
          id?: string
          image_url?: string | null
          images?: string[]
          main_image?: string | null
          name: string
          original_price?: number | null
          price?: number
          price_updated_at?: string
          promo_price?: number | null
          recommended?: boolean
          slug: string
          store?: string | null
          store_id?: string | null
          tags?: string[]
          updated_at?: string
          videos?: string[]
          view_count?: number
        }
        Update: {
          active?: boolean
          affiliate_url?: string | null
          badge?: string | null
          best_seller?: boolean
          bestseller?: boolean
          category_id?: string | null
          click_count?: number
          created_at?: string
          description?: string | null
          expires_at?: string | null
          external_url?: string | null
          featured?: boolean
          features?: string[]
          id?: string
          image_url?: string | null
          images?: string[]
          main_image?: string | null
          name?: string
          original_price?: number | null
          price?: number
          price_updated_at?: string
          promo_price?: number | null
          recommended?: boolean
          slug?: string
          store?: string | null
          store_id?: string | null
          tags?: string[]
          updated_at?: string
          videos?: string[]
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_banners: {
        Row: {
          active: boolean
          category_id: string | null
          collection_id: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          collection_id?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          title: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          collection_id?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotional_banners_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "video_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          affiliate_notice: string | null
          contact_email: string | null
          favicon_url: string | null
          footer_text: string | null
          id: number
          instagram: string | null
          logo_url: string | null
          primary_color: string
          seo_description: string | null
          seo_title: string | null
          share_image_url: string | null
          site_name: string
          slogan: string
          tiktok: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          affiliate_notice?: string | null
          contact_email?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: number
          instagram?: string | null
          logo_url?: string | null
          primary_color?: string
          seo_description?: string | null
          seo_title?: string | null
          share_image_url?: string | null
          site_name?: string
          slogan?: string
          tiktok?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          affiliate_notice?: string | null
          contact_email?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          id?: number
          instagram?: string | null
          logo_url?: string | null
          primary_color?: string
          seo_description?: string | null
          seo_title?: string | null
          share_image_url?: string | null
          site_name?: string
          slogan?: string
          tiktok?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_collection_products: {
        Row: {
          collection_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "video_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      video_collections: {
        Row: {
          active: boolean
          cover_url: string
          created_at: string
          id: string
          sort_order: number
          title: string
          video_url: string
        }
        Insert: {
          active?: boolean
          cover_url: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
          video_url: string
        }
        Update: {
          active?: boolean
          cover_url?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
          video_url?: string
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
      is_admin: { Args: never; Returns: boolean }
      register_click: {
        Args: { _banner_id: string; _product_id: string; _visitor: string }
        Returns: undefined
      }
      register_view: {
        Args: { _product_id: string; _visitor: string }
        Returns: undefined
      }
      save_video_collection: {
        Args: {
          p_active: boolean
          p_cover_url: string
          p_id: string
          p_product_ids: string[]
          p_sort_order: number
          p_title: string
          p_video_url: string
        }
        Returns: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
