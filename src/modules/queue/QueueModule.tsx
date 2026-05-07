import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, Unlock } from 'lucide-react';
import { QueueService } from '../../services/queueService';
import { BarbershopService } from '../../services/barbershopService';
import { useQueueRealtime } from '../../hooks/useQueueRealtime';
import { useQueueMutations } from '../../hooks/useQueueMutations';
import { useAppStore } from '../../store/useAppStore';

import { StatusCard } from './components/StatusCard';
import { QueueItem } from './components/QueueItem';
import { JoinQueueSheet } from './components/JoinQueueSheet';
import { CustomerQueueView } from './components/CustomerQueueView';
import { PinSheet } from './components/PinSheet';
import { ConfirmDialog } from './components/ConfirmDialog';

// ─── Constants ────────────────────────────────────────────────
const SHOP_ID = '00000000-0000-0000-0000-000000000001';
const AVG_TIME = 25;

// ─── QueueModule (Componente Principal) ───────────────────────

export default function QueueModule() {
  const viewMode = useAppStore((s) => s.viewMode);
  const unlock = useAppStore((s) => s.unlock);
  const lock = useAppStore((s) => s.lock);

  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{
    action: 'finish' | 'remove';
    entryId: string;
    name: string;
  } | null>(null);

  // ─── Data ─────────────────────────────────────────────────
  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['queue', SHOP_ID],
    queryFn: () => QueueService.getActiveQueue(SHOP_ID),
  });

  const { data: shop } = useQuery({
    queryKey: ['shop', SHOP_ID],
    queryFn: () => BarbershopService.getShop(SHOP_ID),
  });

  useQueueRealtime(SHOP_ID);

  const { joinMutation, callNextMutation, finishMutation, removeMutation } =
    useQueueMutations(SHOP_ID);

  // ─── Handlers ─────────────────────────────────────────────
  const handleAction = (action: 'call' | 'finish' | 'remove', entryId: string) => {
    if (action === 'call') {
      callNextMutation.mutate();
      return;
    }
    const entry = queue.find((e) => e.id === entryId);
    setConfirmState({ action, entryId, name: entry?.customer_name ?? 'Cliente' });
  };

  const handleConfirm = () => {
    if (!confirmState) return;
    const closeDialog = { onSuccess: () => setConfirmState(null) };
    if (confirmState.action === 'finish') finishMutation.mutate(confirmState.entryId, closeDialog);
    if (confirmState.action === 'remove') removeMutation.mutate(confirmState.entryId, closeDialog);
  };

  const handlePinVerify = async (pin: string): Promise<boolean> => {
    const isValid = await BarbershopService.verifyPin(SHOP_ID, pin);
    if (isValid) { unlock(); setIsPinOpen(false); }
    return isValid;
  };

  const handleJoin = (name: string, phone: string) => {
    joinMutation.mutate({ name, phone }, {
      onSuccess: () => setIsJoinOpen(false),
    });
  };

  // ─── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-10 h-10 rounded-full border-4 border-surface-800 border-t-brand-gold animate-spin mb-4" />
        <p className="text-surface-400 text-sm font-medium animate-pulse">Carregando fila...</p>
      </div>
    );
  }

  const waitingEntries = queue.filter((e) => e.status === 'waiting');
  const inProgressEntry = queue.find((e) => e.status === 'in_progress');
  const isOpen = shop?.is_open ?? false;

  // ─── Visão Cliente ────────────────────────────────────────
  if (viewMode === 'customer') {
    return (
      <>
        <CustomerQueueView
          totalInQueue={queue.length}
          avgTime={AVG_TIME}
          hasInProgress={!!inProgressEntry}
          isOpen={isOpen}
          onOpenPinSheet={() => setIsPinOpen(true)}
          onOpenJoinSheet={() => setIsJoinOpen(true)}
        />
        <JoinQueueSheet
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onJoin={handleJoin}
          isPending={joinMutation.isPending}
        />
        <PinSheet
          isOpen={isPinOpen}
          onClose={() => setIsPinOpen(false)}
          onVerify={handlePinVerify}
        />
      </>
    );
  }

  // ─── Visão Barbeiro ───────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in">
      <StatusCard totalWaiting={waitingEntries.length} avgTime={AVG_TIME} hasInProgress={!!inProgressEntry} />

      {waitingEntries.length > 0 && (
        <button
          type="button"
          onClick={() => callNextMutation.mutate()}
          disabled={callNextMutation.isPending}
          className="w-full h-14 rounded-2xl bg-brand-gold text-surface-900 font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 active:scale-[0.97] transition-all duration-150 disabled:opacity-40"
        >
          {callNextMutation.isPending
            ? <div className="w-5 h-5 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
            : <UserPlus className="w-5 h-5" />
          }
          {inProgressEntry ? 'Finalizar e Chamar Próximo' : 'Chamar Próximo'}
        </button>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Na fila</h2>
          <span className="text-xs text-surface-500">
            {queue.length} {queue.length === 1 ? 'pessoa' : 'pessoas'}
          </span>
        </div>

        <div className="space-y-2">
          {inProgressEntry && (
            <QueueItem entry={inProgressEntry} position={0} onAction={handleAction} />
          )}

          <button
            type="button"
            onClick={() => setIsJoinOpen(true)}
            className="w-full h-12 rounded-xl bg-surface-800 border border-surface-700/30 border-dashed text-surface-400 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-150"
          >
            <UserPlus className="w-4 h-4" />
            Adicionar na fila
          </button>

          {waitingEntries.map((entry, index) => (
            <QueueItem key={entry.id} entry={entry} position={index + 1} onAction={handleAction} />
          ))}

          {queue.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-sm text-surface-400">Ninguém na fila ainda</p>
              <p className="text-xs text-surface-500 mt-1">Adicione clientes ou aguarde entradas</p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={lock}
        className="mx-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-surface-500 hover:text-surface-300 transition-colors text-xs"
      >
        <Unlock className="w-3.5 h-3.5" />
        Sair do modo gerente
      </button>

      <JoinQueueSheet
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={handleJoin}
        isPending={joinMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!confirmState}
        title={confirmState?.action === 'remove' ? 'Remover da fila?' : 'Finalizar atendimento?'}
        message={
          confirmState?.action === 'remove'
            ? `"${confirmState.name}" será removido da fila permanentemente.`
            : `O atendimento de "${confirmState?.name}" será encerrado.`
        }
        confirmLabel={confirmState?.action === 'remove' ? 'Remover' : 'Finalizar'}
        variant={confirmState?.action === 'remove' ? 'danger' : 'default'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmState(null)}
        isPending={finishMutation.isPending || removeMutation.isPending}
      />
    </div>
  );
}
