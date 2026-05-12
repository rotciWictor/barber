import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../core/supabase';
import { logger } from '../core/logger';

/**
 * Escuta mudanças em tempo real na tabela `queue` via Supabase Channels.
 * Quando qualquer INSERT, UPDATE ou DELETE acontece, invalida o cache
 * do React Query para que a UI atualize automaticamente.
 *
 * Não manipula cache diretamente — simplesmente dispara um refetch.
 */
export function useQueueRealtime(barbershopId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    logger.debug(`[Realtime] Inscrevendo-se no canal queue:${barbershopId}`, { category: 'Realtime' });
    const channel = supabase
      .channel(`queue:${barbershopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
          filter: `barbershop_id=eq.${barbershopId}`,
        },
        (payload) => {
          logger.info(`[Realtime] Evento recebido: ${payload.eventType}`, { category: 'Realtime', metadata: { payload } });
          queryClient.invalidateQueries({
            queryKey: ['queue', barbershopId],
          });
        },
      )
      .subscribe((status) => {
        logger.debug(`[Realtime] Status da inscrição: ${status}`, { category: 'Realtime' });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [barbershopId, queryClient]);
}
