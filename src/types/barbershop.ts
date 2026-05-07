/** Tabela: barbershops */
export interface Barbershop {
  id: string;
  owner_id: string;
  name: string;
  is_open: boolean;
  /** Tempo médio de atendimento em minutos */
  avg_time_minutes: number;
  /** PIN de acesso ao modo barbeiro (não retornado pelo getShop) */
  pin?: string;
  created_at?: string;
  updated_at?: string;
}

export type BarbershopInsert = Omit<Barbershop, 'id' | 'created_at' | 'updated_at'>;
export type BarbershopUpdate = Partial<Omit<Barbershop, 'id' | 'owner_id'>>;
