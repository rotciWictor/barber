import { supabase } from '../core/supabase';
import { logger } from '../core/logger';
import type { QueueEntry, QueueEntryInsert } from '../types/queue';

// ─── Helpers de mapeamento (DB ↔ Frontend) ────────────────────

/** Converte as colunas separadas do banco para o tipo WhatsAppContact */
function mapRowToQueueEntry(row: {
  id: string;
  barbershop_id: string;
  customer_name: string;
  whatsapp_phone: string;
  whatsapp_uid: string | null;
  clerk_user_id: string | null;
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
    clerk_user_id: row.clerk_user_id ?? undefined,
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
    clerk_user_id: entry.clerk_user_id ?? null,
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
    logger.debug(`[joinQueue] Iniciando inserção para ${entry.customer_name}`, { category: 'Supabase', metadata: { phone: entry.whatsapp.phone } });
    const { data, error } = await supabase
      .from('queue')
      .insert(mapInsertToRow(entry))
      .select()
      .single();

    if (error) {
      logger.error('Falha ao entrar na fila', { category: 'Supabase', error });
      throw new Error(`Erro ao entrar na fila: ${error.message}`);
    }
    
    logger.info(`Cliente ${entry.customer_name} adicionado à fila com sucesso`, { category: 'Supabase' });
    return mapRowToQueueEntry(data);
  },

  /**
   * Verifica se um usuário Clerk já tem uma entrada ativa na fila.
   * Usado para impedir entradas duplicadas.
   */
  async isAlreadyInQueue(barbershopId: string, clerkUserId: string): Promise<boolean> {
    logger.debug(`[isAlreadyInQueue] Verificando duplicata para clerkUser: ${clerkUserId}`, { category: 'Supabase' });
    const { data, error } = await supabase
      .from('queue')
      .select('id')
      .eq('barbershop_id', barbershopId)
      .eq('clerk_user_id', clerkUserId)
      .in('status', ['waiting', 'in_progress'])
      .maybeSingle();

    if (error) {
      logger.error('Falha ao verificar duplicata na fila', { category: 'Supabase', error });
      throw new Error(`Erro ao verificar fila: ${error.message}`);
    }
    return data !== null;
  },

  /**
   * Busca clientes ativos na fila (waiting + in_progress),
   * ordenados por ordem de chegada.
   */
  async getActiveQueue(barbershopId: string): Promise<QueueEntry[]> {
    logger.debug(`[getActiveQueue] Buscando fila para barbearia: ${barbershopId}`, { category: 'Supabase' });
    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .in('status', ['waiting', 'in_progress'])
      .order('joined_at', { ascending: true });

    if (error) {
      logger.error('Falha ao buscar fila ativa', { category: 'Supabase', error });
      throw new Error(`Erro ao buscar fila: ${error.message}`);
    }
    return (data ?? []).map(mapRowToQueueEntry);
  },

  /**
   * Atualiza o status de um cliente na fila.
   */
  async updateStatus(
    entryId: string,
    status: QueueEntry['status'],
  ): Promise<QueueEntry> {
    logger.info(`[updateStatus] Mudando status do entry ${entryId} para ${status}`, { category: 'Supabase' });
    const { data, error } = await supabase
      .from('queue')
      .update({ status })
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      logger.error(`Falha ao atualizar status para ${status}`, { category: 'Supabase', error });
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
    return mapRowToQueueEntry(data);
  },

  /**
   * Chama o próximo da fila.
   * Finaliza quem está em atendimento (se houver) e promove o próximo waiting.
   * 
   * TODO (Escalabilidade): Quando evoluir para multi-barbeiros, mover esta função 
   * para uma Supabase RPC (PostgreSQL Function) para executar em uma única TRANSACTION,
   * evitando race conditions se 2 barbeiros chamarem ao mesmo tempo.
   */
  async callNext(barbershopId: string): Promise<QueueEntry | null> {
    logger.info('[callNext] Iniciando transação para chamar o próximo', { category: 'Supabase' });
    // 1. Finaliza quem está in_progress
    const { data: current } = await supabase
      .from('queue')
      .select('id')
      .eq('barbershop_id', barbershopId)
      .eq('status', 'in_progress')
      .maybeSingle();

    if (current) {
      logger.debug(`[callNext] Finalizando atendimento atual (ID: ${current.id})`, { category: 'Supabase' });
      await supabase
        .from('queue')
        .update({ status: 'finished' })
        .eq('id', current.id);
    }

    // 2. Busca o próximo waiting (mais antigo)
    const { data: next, error } = await supabase
      .from('queue')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .eq('status', 'waiting')
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('Falha ao buscar o próximo da fila', { category: 'Supabase', error });
      throw new Error(`Erro ao chamar próximo: ${error.message}`);
    }
    if (!next) {
      logger.info('[callNext] Ninguém aguardando na fila', { category: 'Supabase' });
      return null;
    }

    // 3. Promove para in_progress
    logger.debug(`[callNext] Promovendo próximo cliente (ID: ${next.id}) para in_progress`, { category: 'Supabase' });
    const { error: promoteErr } = await supabase
      .from('queue')
      .update({ status: 'in_progress' })
      .eq('id', next.id);

    if (promoteErr) {
      logger.error('Falha ao promover cliente para in_progress', { category: 'Supabase', error: promoteErr });
      throw new Error(`Erro ao promover: ${promoteErr.message}`);
    }
    
    logger.info(`[callNext] Próximo cliente chamado com sucesso: ${next.customer_name}`, { category: 'Supabase' });
    return mapRowToQueueEntry({ ...next, status: 'in_progress' });
  },

  /**
   * Finaliza o atendimento atual (muda para finished).
   */
  async finishCurrent(entryId: string): Promise<void> {
    logger.info(`[finishCurrent] Finalizando cliente manualmente (ID: ${entryId})`, { category: 'Supabase' });
    const { error } = await supabase
      .from('queue')
      .update({ status: 'finished' })
      .eq('id', entryId);

    if (error) {
      logger.error('Falha ao finalizar cliente', { category: 'Supabase', error });
      throw new Error(`Erro ao finalizar: ${error.message}`);
    }
  },

  /**
   * Remove um cliente da fila (muda status para cancelled).
   * Os dados são preservados para analytics e histórico.
   */
  async removeFromQueue(entryId: string): Promise<void> {
    logger.info(`[removeFromQueue] Cancelando entrada da fila (ID: ${entryId})`, { category: 'Supabase' });
    const { error } = await supabase
      .from('queue')
      .update({ status: 'cancelled' })
      .eq('id', entryId);

    if (error) {
      logger.error('Falha ao remover cliente da fila', { category: 'Supabase', error });
      throw new Error(`Erro ao remover: ${error.message}`);
    }
  },
} as const;
