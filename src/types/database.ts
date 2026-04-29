/**
 * Mapeamento do schema PostgreSQL para tipagem do cliente Supabase.
 * Usado em: createClient<Database>(url, key)
 *
 * As colunas WhatsApp são separadas no banco (whatsapp_phone, whatsapp_uid)
 * e agrupadas no front como WhatsAppContact via camada /services.
 */
export interface Database {
  public: {
    Tables: {
      barbershops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          is_open: boolean;
          avg_time_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          is_open?: boolean;
          avg_time_minutes?: number;
        };
        Update: {
          name?: string;
          is_open?: boolean;
          avg_time_minutes?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          barbershop_id: string;
          name: string;
          price: number;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id: string;
          name: string;
          price: number;
          image_url?: string | null;
        };
        Update: {
          name?: string;
          price?: number;
          image_url?: string | null;
        };
        Relationships: [];
      };
      queue: {
        Row: {
          id: string;
          barbershop_id: string;
          customer_name: string;
          whatsapp_phone: string;
          whatsapp_uid: string | null;
          status: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          barbershop_id: string;
          customer_name: string;
          whatsapp_phone: string;
          whatsapp_uid?: string | null;
          status?: string;
        };
        Update: {
          customer_name?: string;
          whatsapp_phone?: string;
          whatsapp_uid?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      user_chapters: {
        Row: {
          user_id: string;
          chapter_id: string;
          is_active: boolean;
        };
        Insert: {
          user_id: string;
          chapter_id: string;
          is_active?: boolean;
        };
        Update: {
          is_active?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
