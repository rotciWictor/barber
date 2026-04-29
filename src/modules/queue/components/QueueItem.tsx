import { Scissors, ArrowRight, MessageCircle } from 'lucide-react';
import type { QueueEntry } from '../../../types/queue';
import { getWhatsAppLink, formatJoinedAt } from '../utils/queueUtils';

export function QueueItem({
  entry,
  position,
}: {
  entry: QueueEntry;
  position: number;
}) {
  const isInProgress = entry.status === 'in_progress';

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-xl transition-all duration-200
        ${isInProgress
          ? 'bg-status-in-progress/5 border border-status-in-progress/20'
          : 'bg-surface-800 border border-surface-700/30'
        }
      `}
    >
      {/* Posição / Indicador */}
      <div
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
          ${isInProgress
            ? 'bg-status-in-progress/15 text-status-in-progress'
            : 'bg-surface-700/50 text-surface-400'
          }
        `}
      >
        {isInProgress ? <Scissors className="w-5 h-5" /> : position}
      </div>

      {/* Info do cliente */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-100 truncate">
          {entry.customer_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-surface-400">
            {formatJoinedAt(entry.joined_at)}
          </span>
          {isInProgress && (
            <>
              <ArrowRight className="w-3 h-3 text-status-in-progress" />
              <span className="text-xs font-medium text-status-in-progress">
                Em atendimento
              </span>
            </>
          )}
        </div>
      </div>

      {/* Ação WhatsApp */}
      <a
        href={getWhatsAppLink(entry.whatsapp.phone)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
        aria-label={`Enviar mensagem para ${entry.customer_name}`}
      >
        <MessageCircle className="w-4.5 h-4.5 text-green-400" />
      </a>
    </div>
  );
}
