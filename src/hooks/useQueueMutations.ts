import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueueService } from '../services/queueService';

/**
 * Hook que encapsula todas as mutations da fila.
 * Extraído do QueueModule para manter os arquivos enxutos.
 */
export function useQueueMutations(shopId: string) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['queue', shopId] });

  const joinMutation = useMutation({
    mutationFn: ({ name, phone }: { name: string; phone: string }) =>
      QueueService.joinQueue({
        barbershop_id: shopId,
        customer_name: name,
        whatsapp: { phone: phone.replace(/\D/g, '') },
        status: 'waiting',
      }),
    onSuccess: invalidate,
    onError: () => alert('Erro ao entrar na fila. Tente novamente.'),
  });

  const callNextMutation = useMutation({
    mutationFn: () => QueueService.callNext(shopId),
    onSuccess: invalidate,
    onError: () => alert('Erro ao chamar próximo.'),
  });

  const finishMutation = useMutation({
    mutationFn: (entryId: string) => QueueService.finishCurrent(entryId),
    onSuccess: invalidate,
    onError: () => alert('Erro ao finalizar.'),
  });

  const removeMutation = useMutation({
    mutationFn: (entryId: string) => QueueService.removeFromQueue(entryId),
    onSuccess: invalidate,
    onError: () => alert('Erro ao remover.'),
  });

  return { joinMutation, callNextMutation, finishMutation, removeMutation };
}
