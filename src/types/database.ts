/**
 * Tipagens que espelham o schema do Supabase (PostgreSQL).
 * Mantidas em sincronia manual com as migrations do banco.
 */

// ─── Identidade WhatsApp (Híbrida) ────────────────────────────
export interface WhatsAppContact {
  /** Número formatado com DDI, ex: "5511999999999" */
  phone: string;
  /** UID do WhatsApp Business API (uso futuro) */
  uid?: string;
}

// ─── Tabela: barbershops ──────────────────────────────────────
export interface Barbershop {
  id: string;
  owner_id: string;
  name: string;
  is_open: boolean;
  /** Tempo médio de atendimento em minutos */
  avg_time_minutes: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Tabela: services ─────────────────────────────────────────
export interface Service {
  id: string;
  barbershop_id: string;
  name: string;
  /** Preço em centavos (evita floating point) */
  price: number;
  /** URL da imagem comprimida (< 200KB) */
  image_url: string | null;
  created_at?: string;
}

// ─── Tabela: queue ────────────────────────────────────────────
export type QueueStatus = 'waiting' | 'in_progress' | 'finished';

export interface QueueEntry {
  id: string;
  barbershop_id: string;
  customer_name: string;
  /** Contato WhatsApp do cliente */
  whatsapp: WhatsAppContact;
  status: QueueStatus;
  joined_at: string;
}

// ─── Tabela: user_chapters ────────────────────────────────────
export interface UserChapter {
  user_id: string;
  /** Identificador do módulo (ex: "vitrine", "retention") */
  chapter_id: string;
  is_active: boolean;
}

// ─── Helpers para INSERT / UPDATE (sem campos auto-gerados) ──
export type BarbershopInsert = Omit<Barbershop, 'id' | 'created_at' | 'updated_at'>;
export type BarbershopUpdate = Partial<Omit<Barbershop, 'id' | 'owner_id'>>;

export type ServiceInsert = Omit<Service, 'id' | 'created_at'>;
export type ServiceUpdate = Partial<Omit<Service, 'id' | 'barbershop_id'>>;

export type QueueEntryInsert = Omit<QueueEntry, 'id' | 'joined_at'>;
export type QueueEntryUpdate = Partial<Pick<QueueEntry, 'status'>>;
