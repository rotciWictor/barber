import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueueService } from '../services/queueService';
import { logger } from '../core/logger';

/**
 * Hook que encapsula todas as mutations da fila.
 * Extraído do QueueModule para manter os arquivos enxutos.
 */
export function useQueueMutations(shopId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    logger.debug('[ReactQuery] Invalidando cache da fila', { category: 'Queue' });
    queryClient.invalidateQueries({ queryKey: ['queue', shopId] });
  };

  const joinMutation = useMutation({
    mutationFn: async ({
      name,
      phone,
      clerkUserId,
    }: {
      name: string;
      phone: string;
      clerkUserId?: string;
    }) => {
      // Anti-duplicata: verifica se o usuário já está na fila
      if (clerkUserId) {
        const alreadyIn = await QueueService.isAlreadyInQueue(shopId, clerkUserId);
        if (alreadyIn) {
          throw new Error('ALREADY_IN_QUEUE');
        }
      }

      return QueueService.joinQueue({
        barbershop_id: shopId,
        customer_name: name,
        whatsapp: { phone: phone.replace(/\D/g, '') },
        clerk_user_id: clerkUserId,
        status: 'waiting',
      });
    },
    onSuccess: invalidate,
  });

  const callNextMutation = useMutation({
    mutationFn: () => QueueService.callNext(shopId),
    onSuccess: () => invalidate(),
    onError: (error) => logger.error('Erro no mutation callNext', { category: 'Queue', error }),
  });

  const finishMutation = useMutation({
    mutationFn: (entryId: string) => QueueService.finishCurrent(entryId),
    onSuccess: invalidate,
    onError: (error) => logger.error('Erro no mutation finish', { category: 'Queue', error }),
  });

  const removeMutation = useMutation({
    mutationFn: (entryId: string) => QueueService.removeFromQueue(entryId),
    onSuccess: invalidate,
    onError: (error) => logger.error('Erro no mutation remove', { category: 'Queue', error }),
  });

  return { joinMutation, callNextMutation, finishMutation, removeMutation };
}
