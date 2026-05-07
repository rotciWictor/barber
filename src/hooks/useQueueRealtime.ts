import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../core/supabase';

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
        () => {
          queryClient.invalidateQueries({
            queryKey: ['queue', barbershopId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [barbershopId, queryClient]);
}
