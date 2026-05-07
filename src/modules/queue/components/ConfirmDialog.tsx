interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

/**
 * Modal de confirmação para ações destrutivas.
 * Usado ao finalizar ou remover clientes da fila.
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
  isPending,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmColors = variant === 'danger'
    ? 'bg-status-closed hover:bg-status-closed/90'
    : 'bg-brand-gold hover:bg-brand-gold-light text-surface-900';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onCancel}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
        role="presentation"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-surface-800 border border-surface-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-lg font-semibold text-surface-100 mb-2">
            {title}
          </h3>
          <p className="text-sm text-surface-400 mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="flex-1 h-12 rounded-xl bg-surface-700 text-surface-200 font-medium text-sm active:scale-[0.97] transition-all disabled:opacity-40"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={`flex-1 h-12 rounded-xl font-medium text-sm flex items-center justify-center active:scale-[0.97] transition-all disabled:opacity-40 ${confirmColors}`}
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
