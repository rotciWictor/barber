import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus } from 'lucide-react';
import { QueueService } from '../../services/queueService';

import { StatusCard } from './components/StatusCard';
import { QueueItem } from './components/QueueItem';
import { JoinQueueSheet } from './components/JoinQueueSheet';

// ─── Constants ────────────────────────────────────────────────
const MOCK_AVG_TIME = 25; // minutos

// ─── QueueModule (Componente Principal) ───────────────────────

export default function QueueModule() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['queue', '00000000-0000-0000-0000-000000000001'],
    queryFn: () => QueueService.getActiveQueue('00000000-0000-0000-0000-000000000001'),
  });

  const joinMutation = useMutation({
    mutationFn: ({ name, phone }: { name: string; phone: string }) =>
      QueueService.joinQueue({
        barbershop_id: '00000000-0000-0000-0000-000000000001',
        customer_name: name,
        whatsapp: { phone: phone.replace(/\D/g, '') },
        status: 'waiting',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue', '00000000-0000-0000-0000-000000000001'] });
      setIsSheetOpen(false);
    },
    onError: (error) => {
      console.error(error);
      alert('Erro ao entrar na fila. Tente novamente.');
    },
  });

  const handleJoin = (name: string, phone: string) => {
    joinMutation.mutate({ name, phone });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-10 h-10 rounded-full border-4 border-surface-800 border-t-brand-gold animate-spin mb-4" />
        <p className="text-surface-400 text-sm font-medium animate-pulse">
          Carregando fila...
        </p>
      </div>
    );
  }

  const waitingEntries = queue.filter((e) => e.status === 'waiting');
  const inProgressEntry = queue.find((e) => e.status === 'in_progress');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Card de status */}
      <StatusCard
        totalWaiting={waitingEntries.length}
        avgTime={MOCK_AVG_TIME}
        hasInProgress={!!inProgressEntry}
      />

      {/* Lista da fila */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            Na fila
          </h2>
          <span className="text-xs text-surface-500">
            {queue.length} {queue.length === 1 ? 'pessoa' : 'pessoas'}
          </span>
        </div>

        <div className="space-y-2">
          {/* Em atendimento primeiro */}
          {inProgressEntry && (
            <QueueItem entry={inProgressEntry} position={0} />
          )}

          {/* Botão inline — sempre abaixo do atendimento atual */}
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="w-full h-14 rounded-2xl bg-brand-gold text-surface-900 font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 active:scale-[0.97] transition-all duration-150"
          >
            <UserPlus className="w-5 h-5" />
            Entrar na Fila
          </button>

          {/* Aguardando */}
          {waitingEntries.map((entry, index) => (
            <QueueItem
              key={entry.id}
              entry={entry}
              position={index + 1}
            />
          ))}

          {queue.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-sm text-surface-400">Ninguém na fila ainda</p>
              <p className="text-xs text-surface-500 mt-1">Seja o primeiro!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      <JoinQueueSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onJoin={handleJoin}
        isPending={joinMutation.isPending}
      />
    </div>
  );
}
