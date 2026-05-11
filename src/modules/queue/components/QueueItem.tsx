import { Scissors, ArrowRight, MessageCircle, PhoneForwarded, CheckCircle, X } from 'lucide-react';
import type { QueueEntry } from '../../../types/queue';
import { getWhatsAppNotifyLink, formatJoinedAt } from '../utils/queueUtils';

type QueueAction = 'call' | 'finish' | 'remove';

interface QueueItemProps {
  entry: QueueEntry;
  position: number;
  /** Quando presente, exibe botões de ação (modo barbeiro) */
  onAction?: (action: QueueAction, entryId: string) => void;
}

/**
 * Card individual de um cliente na fila.
 * No modo barbeiro: exibe nome, WhatsApp, horário e botões de ação.
 * No modo cliente: não é renderizado (CustomerQueueView cuida da visão anônima).
 */
export function QueueItem({ entry, position, onAction }: QueueItemProps) {
  const isInProgress = entry.status === 'in_progress';

  // Mensagem contextual para WhatsApp
  const whatsAppType = isInProgress ? 'called' : position === 1 ? 'next' : 'called';
  const whatsAppLink = getWhatsAppNotifyLink(
    entry.whatsapp.phone,
    entry.customer_name,
    whatsAppType,
  );

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

      {/* Ações (modo barbeiro) */}
      {onAction && (
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Chamar próximo (só para waiting) */}
          {!isInProgress && (
            <button
              type="button"
              onClick={() => onAction('call', entry.id)}
              className="w-9 h-9 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center active:scale-90 transition-transform"
              aria-label={`Chamar ${entry.customer_name}`}
              title="Chamar"
            >
              <PhoneForwarded className="w-4 h-4 text-brand-gold" />
            </button>
          )}

          {/* Finalizar (só para in_progress) */}
          {isInProgress && (
            <button
              type="button"
              onClick={() => onAction('finish', entry.id)}
              className="w-9 h-9 rounded-lg bg-status-open/10 border border-status-open/20 flex items-center justify-center active:scale-90 transition-transform"
              aria-label={`Finalizar ${entry.customer_name}`}
              title="Finalizar"
            >
              <CheckCircle className="w-4 h-4 text-status-open" />
            </button>
          )}

          {/* Remover */}
          <button
            type="button"
            onClick={() => onAction('remove', entry.id)}
            className="w-9 h-9 rounded-lg bg-status-closed/10 border border-status-closed/20 flex items-center justify-center active:scale-90 transition-transform"
            aria-label={`Remover ${entry.customer_name}`}
            title="Remover"
          >
            <X className="w-4 h-4 text-status-closed" />
          </button>
        </div>
      )}

      {/* WhatsApp — notificação contextual (modo barbeiro) */}
      {onAction && (
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          aria-label={`Notificar ${entry.customer_name} via WhatsApp`}
          title={isInProgress ? 'Avisar: sua vez chegou!' : position === 1 ? 'Avisar: você é o próximo!' : 'Enviar mensagem'}
        >
          <MessageCircle className="w-4 h-4 text-green-400" />
        </a>
      )}
    </div>
  );
}
