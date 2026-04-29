import { Users, Clock, Scissors } from 'lucide-react';
import { getEstimatedWait } from '../utils/queueUtils';

export function StatusCard({
  totalWaiting,
  avgTime,
  hasInProgress,
}: {
  totalWaiting: number;
  avgTime: number;
  hasInProgress: boolean;
}) {
  const estimatedWait = getEstimatedWait(totalWaiting, avgTime);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900 border border-surface-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-gold/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-gold" />
          </div>
          <div>
            <p className="text-xs text-surface-400 leading-none mb-0.5">Fila atual</p>
            <p className="text-xl font-bold text-surface-100">
              {totalWaiting} {totalWaiting === 1 ? 'pessoa' : 'pessoas'}
            </p>
          </div>
        </div>

        {hasInProgress && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-in-progress/10 border border-status-in-progress/20">
            <Scissors className="w-3.5 h-3.5 text-status-in-progress animate-pulse" />
            <span className="text-xs font-medium text-status-in-progress">Atendendo</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-surface-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">
          Tempo estimado de espera: <span className="text-surface-200 font-medium">{estimatedWait}</span>
        </span>
      </div>
    </div>
  );
}
