import { useState } from 'react';
import { UserPlus, Phone } from 'lucide-react';

export function JoinQueueSheet({
  isOpen,
  onClose,
  onJoin,
  isPending,
}: {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (name: string, phone: string) => void;
  isPending?: boolean;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || isPending) return;
    onJoin(name.trim(), phone.trim());
    // The parent will close the modal on success.
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="presentation"
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in">
        <div className="bg-surface-800 border-t border-surface-700/50 rounded-t-3xl p-6 pb-8">
          {/* Handle */}
          <div className="w-10 h-1 bg-surface-600 rounded-full mx-auto mb-6" />

          <h3 className="text-lg font-semibold text-surface-100 mb-5">
            Entrar na Fila
          </h3>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="queue-name" className="block text-xs text-surface-400 mb-1.5 font-medium">
                Seu nome
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-500" />
                <input
                  id="queue-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-900 border border-surface-700/50 text-surface-100 text-sm placeholder:text-surface-500 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/25 transition-colors"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="queue-phone" className="block text-xs text-surface-400 mb-1.5 font-medium">
                WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-500" />
                <input
                  id="queue-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-surface-900 border border-surface-700/50 text-surface-100 text-sm placeholder:text-surface-500 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/25 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Botão de confirmar */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || !phone.trim() || isPending}
            className="w-full h-14 mt-6 rounded-2xl bg-brand-gold text-surface-900 font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:active:scale-100"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {isPending ? 'Entrando...' : 'Confirmar entrada'}
          </button>
        </div>
      </div>
    </>
  );
}
