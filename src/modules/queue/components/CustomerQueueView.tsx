import { Users, Clock, Lock } from 'lucide-react';
import { useUser, useClerk } from '@clerk/react';
import { getEstimatedWait } from '../utils/queueUtils';

interface CustomerQueueViewProps {
  totalInQueue: number;
  avgTime: number;
  hasInProgress: boolean;
  isOpen: boolean;
  onOpenPinSheet: () => void;
  onOpenJoinSheet: () => void;
}

/**
 * Visão pública da fila — exibida para clientes.
 * Nenhum nome ou dado pessoal é mostrado, apenas posições numéricas.
 */
export function CustomerQueueView({
  totalInQueue,
  avgTime,
  hasInProgress,
  isOpen,
  onOpenPinSheet,
  onOpenJoinSheet,
}: CustomerQueueViewProps) {
  const { isSignedIn, isLoaded } = useUser();
  const clerk = useClerk();
  
  const waitingCount = hasInProgress ? totalInQueue - 1 : totalInQueue;
  const estimatedWait = getEstimatedWait(waitingCount, avgTime);

  const handleJoinClick = () => {
    if (!isLoaded) return;
    if (isSignedIn) {
      onOpenJoinSheet();
    } else {
      clerk.openSignIn();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Card de status (anônimo) */}
      <div className="rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-gold/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <p className="text-xs text-surface-400 leading-none mb-0.5">Fila atual</p>
              <p className="text-xl font-bold text-surface-100">
                {waitingCount} {waitingCount === 1 ? 'pessoa' : 'pessoas'}
              </p>
            </div>
          </div>

          {hasInProgress && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-in-progress/10 border border-status-in-progress/20">
              <div className="w-2 h-2 rounded-full bg-status-in-progress animate-pulse" />
              <span className="text-xs font-medium text-status-in-progress">Atendendo</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-surface-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            Espera estimada: <span className="text-surface-200 font-medium">{estimatedWait}</span>
          </span>
        </div>
      </div>

      {/* Lista de posições (anônima) */}
      <div>
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">
          Posições na fila
        </h2>

        <div className="space-y-2">
          {hasInProgress && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-status-in-progress/5 border border-status-in-progress/20">
              <div className="w-10 h-10 rounded-xl bg-status-in-progress/15 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 rounded-full bg-status-in-progress animate-pulse" />
              </div>
              <p className="text-sm font-medium text-status-in-progress">Em atendimento</p>
            </div>
          )}

          {/* Botão para entrar na fila */}
          {isOpen ? (
            <button
              type="button"
              onClick={handleJoinClick}
              disabled={!isLoaded}
              className="w-full h-14 rounded-2xl bg-brand-gold text-surface-900 font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 active:scale-[0.97] transition-all duration-150 disabled:opacity-50"
            >
              {isLoaded ? <Users className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />}
              Entrar na Fila
            </button>
          ) : (
            <div className="w-full h-14 rounded-2xl bg-surface-800 border border-surface-700/50 text-surface-400 font-medium text-sm flex items-center justify-center gap-2">
              Fila fechada no momento
            </div>
          )}

          {/* Posições numéricas */}
          {Array.from({ length: waitingCount }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl bg-surface-800 border border-surface-700/30"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-700/50 flex items-center justify-center shrink-0 font-bold text-sm text-surface-400">
                {i + 1}
              </div>
              <p className="text-sm text-surface-400">
                {i + 1}º na fila
              </p>
            </div>
          ))}

          {totalInQueue === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-sm text-surface-400">Ninguém na fila ainda</p>
              <p className="text-xs text-surface-500 mt-1">Seja o primeiro!</p>
            </div>
          )}
        </div>
      </div>

      {/* Botão discreto para acessar modo barbeiro */}
      <button
        type="button"
        onClick={onOpenPinSheet}
        className="mx-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-surface-500 hover:text-surface-300 transition-colors text-xs"
        aria-label="Acessar modo gerente"
      >
        <Lock className="w-3.5 h-3.5" />
        Modo gerente
      </button>
    </div>
  );
}
