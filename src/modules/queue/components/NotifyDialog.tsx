import { MessageCircle, X } from 'lucide-react';
import type { QueueEntry } from '../../../types/queue';
import { getWhatsAppNotifyLink } from '../utils/queueUtils';

interface NotifyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  calledEntry: QueueEntry | null;
  nextEntry: QueueEntry | null;
}

export function NotifyDialog({
  isOpen,
  onClose,
  calledEntry,
  nextEntry,
}: NotifyDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="presentation"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-100">
              Notificar Clientes
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-surface-400 mb-6">
            O atendimento foi iniciado. Deseja enviar um aviso via WhatsApp?
          </p>

          <div className="space-y-3">
            {calledEntry && (
              <a
                href={getWhatsAppNotifyLink(calledEntry.whatsapp.phone, calledEntry.customer_name, 'called')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-status-in-progress/10 border border-status-in-progress/20 text-status-in-progress font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Avisar {calledEntry.customer_name} (Sua vez!)
              </a>
            )}

            {nextEntry && (
              <a
                href={getWhatsAppNotifyLink(nextEntry.whatsapp.phone, nextEntry.customer_name, 'next')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-surface-700 text-surface-200 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:bg-surface-600"
              >
                <MessageCircle className="w-4 h-4" />
                Avisar {nextEntry.customer_name} (Você é o próximo)
              </a>
            )}

            {!calledEntry && !nextEntry && (
              <p className="text-sm text-surface-500 text-center py-2">
                Nenhum cliente para notificar.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
