import type { WhatsAppContact } from './whatsapp';

/** Status possíveis de um cliente na fila */
export type QueueStatus = 'waiting' | 'in_progress' | 'finished';

/** Tabela: queue */
export interface QueueEntry {
  id: string;
  barbershop_id: string;
  customer_name: string;
  /** Contato WhatsApp do cliente */
  whatsapp: WhatsAppContact;
  status: QueueStatus;
  joined_at: string;
}

export type QueueEntryInsert = Omit<QueueEntry, 'id' | 'joined_at'>;
export type QueueEntryUpdate = Partial<Pick<QueueEntry, 'status'>>;
