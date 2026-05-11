import { useState, useEffect, useRef } from 'react';
import { UserPlus, Phone, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/react';
import { formatPhone } from '../utils/queueUtils';

export function JoinQueueSheet({
  isOpen,
  onClose,
  onJoin,
  isPending,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (name: string, phone: string, clerkUserId?: string) => void;
  isPending?: boolean;
  error?: string | null;
}) {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  // Pré-preenche nome do Clerk quando abre o sheet
  useEffect(() => {
    if (isOpen) {
      if (user?.firstName) {
        setName(user.fullName ?? user.firstName);
      }
      // Auto-focus no campo certo
      setTimeout(() => {
        if (user?.firstName) {
          // Nome já preenchido → foca no telefone
          document.getElementById('queue-phone')?.focus();
        } else {
          nameRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, user]);

  // Limpa campos ao fechar
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPhone('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim() || isPending) return;
    onJoin(name.trim(), phone.trim(), user?.id);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const isAlreadyInQueue = error === 'ALREADY_IN_QUEUE';

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

          {/* Erro de duplicata */}
          {isAlreadyInQueue && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-status-waiting/10 border border-status-waiting/20">
              <AlertCircle className="w-5 h-5 text-status-waiting shrink-0" />
              <p className="text-sm text-status-waiting">Você já está na fila! Aguarde sua vez.</p>
            </div>
          )}

          {/* Erro genérico */}
          {error && !isAlreadyInQueue && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-status-closed/10 border border-status-closed/20">
              <AlertCircle className="w-5 h-5 text-status-closed shrink-0" />
              <p className="text-sm text-status-closed">Erro ao entrar na fila. Tente novamente.</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label htmlFor="queue-name" className="block text-xs text-surface-400 mb-1.5 font-medium">
                Seu nome
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-500" />
                <input
                  ref={nameRef}
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
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
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
            disabled={!name.trim() || !phone.trim() || isPending || isAlreadyInQueue}
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
