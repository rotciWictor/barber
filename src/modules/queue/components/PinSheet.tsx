import { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface PinSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  isPending?: boolean;
}

const PIN_LENGTH = 4;

/**
 * Bottom sheet para digitar o PIN do barbeiro.
 * 4 inputs numéricos estilo OTP com feedback visual de erro.
 */
export function PinSheet({ isOpen, onClose, onVerify, isPending }: PinSheetProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Foca no primeiro input ao abrir
  useEffect(() => {
    if (isOpen) {
      setDigits(Array(PIN_LENGTH).fill(''));
      setError(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    setError(false);
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-avança para próximo input
    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quando completo
    if (value && index === PIN_LENGTH - 1) {
      const pin = newDigits.join('');
      if (pin.length === PIN_LENGTH) {
        handleSubmit(pin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (pin: string) => {
    const isValid = await onVerify(pin);
    if (!isValid) {
      setError(true);
      setDigits(Array(PIN_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    }
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

          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-brand-gold" />
            <h3 className="text-lg font-semibold text-surface-100">
              Modo Gerente
            </h3>
          </div>

          <p className="text-sm text-surface-400 mb-6">
            Digite o PIN de 4 dígitos para acessar o gerenciamento da fila.
          </p>

          {/* Inputs OTP */}
          <div className={`flex justify-center gap-3 mb-6 ${error ? 'animate-shake' : ''}`}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isPending}
                className={`
                  w-14 h-14 rounded-xl text-center text-2xl font-bold
                  bg-surface-900 border-2 transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-brand-gold/30
                  ${error
                    ? 'border-status-closed text-status-closed'
                    : digit
                      ? 'border-brand-gold/50 text-surface-100'
                      : 'border-surface-700/50 text-surface-100'
                  }
                `}
              />
            ))}
          </div>

          {/* Mensagem de erro */}
          {error && (
            <p className="text-center text-sm text-status-closed mb-4 animate-fade-in">
              PIN incorreto. Tente novamente.
            </p>
          )}

          {/* Loading */}
          {isPending && (
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
