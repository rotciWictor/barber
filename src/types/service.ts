/** Tabela: services */
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

export type ServiceInsert = Omit<Service, 'id' | 'created_at'>;
export type ServiceUpdate = Partial<Omit<Service, 'id' | 'barbershop_id'>>;
