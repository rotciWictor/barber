import { supabase } from '../core/supabase';
import type { QueueEntry, QueueEntryInsert } from '../types/queue';

// ─── Helpers de mapeamento (DB ↔ Frontend) ────────────────────

/** Converte as colunas separadas do banco para o tipo WhatsAppContact */
function mapRowToQueueEntry(row: {
  id: string;
  barbershop_id: string;
  customer_name: string;
  whatsapp_phone: string;
  whatsapp_uid: string | null;
  status: string;
  joined_at: string;
}): QueueEntry {
  return {
    id: row.id,
    barbershop_id: row.barbershop_id,
    customer_name: row.customer_name,
    whatsapp: {
      phone: row.whatsapp_phone,
      uid: row.whatsapp_uid ?? undefined,
    },
    status: row.status as QueueEntry['status'],
    joined_at: row.joined_at,
  };
}

/** Converte WhatsAppContact para colunas separadas do banco */
function mapInsertToRow(entry: QueueEntryInsert) {
  return {
    barbershop_id: entry.barbershop_id,
    customer_name: entry.customer_name,
    whatsapp_phone: entry.whatsapp.phone,
    whatsapp_uid: entry.whatsapp.uid ?? null,
    status: entry.status,
  };
}

// ─── QueueService ─────────────────────────────────────────────

/**
 * Camada de abstração SOLID sobre a tabela `queue` do Supabase.
 * Nenhum componente React deve chamar o Supabase diretamente.
 */
export const QueueService = {
  /**
   * Insere um novo cliente na fila.
   */
  async joinQueue(entry: QueueEntryInsert): Promise<QueueEntry> {
    const { data, error } = await supabase
      .from('queue')
      .insert(mapInsertToRow(entry))
      .select()
      .single();

    if (error) throw new Error(`Erro ao entrar na fila: ${error.message}`);
    return mapRowToQueueEntry(data);
  },

  /**
   * Busca clientes ativos na fila (waiting + in_progress),
   * ordenados por ordem de chegada.
   */
  async getActiveQueue(barbershopId: string): Promise<QueueEntry[]> {
    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .in('status', ['waiting', 'in_progress'])
      .order('joined_at', { ascending: true });

    if (error) throw new Error(`Erro ao buscar fila: ${error.message}`);
    return (data ?? []).map(mapRowToQueueEntry);
  },

  /**
   * Atualiza o status de um cliente na fila.
   */
  async updateStatus(
    entryId: string,
    status: QueueEntry['status'],
  ): Promise<QueueEntry> {
    const { data, error } = await supabase
      .from('queue')
      .update({ status })
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar status: ${error.message}`);
    return mapRowToQueueEntry(data);
  },
} as const;
