import { useState } from 'react';
import {
  Users,
  Scissors,
  Clock,
  ArrowRight,
  UserPlus,
  Phone,
  MessageCircle,
} from 'lucide-react';
import type { QueueEntry } from '../../types/queue';

// ─── Dados mockados para validação visual ─────────────────────
const MOCK_AVG_TIME = 25; // minutos

const MOCK_QUEUE: QueueEntry[] = [
  {
    id: '1',
    barbershop_id: 'shop-1',
    customer_name: 'Carlos Silva',
    whatsapp: { phone: '5511999990001' },
    status: 'in_progress',
    joined_at: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: '2',
    barbershop_id: 'shop-1',
    customer_name: 'Rafael Santos',
    whatsapp: { phone: '5511999990002' },
    status: 'waiting',
    joined_at: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    id: '3',
    barbershop_id: 'shop-1',
    customer_name: 'Pedro Oliveira',
    whatsapp: { phone: '5511999990003' },
    status: 'waiting',
    joined_at: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────

function getEstimatedWait(position: number, avgTime: number): string {
  const minutes = position * avgTime;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
}

function getWhatsAppLink(phone: string): string {
  return `https://wa.me/${phone}`;
}

function formatJoinedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Sub-componentes ──────────────────────────────────────────

function StatusCard({
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

function QueueItem({
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

// ─── Join Modal (Bottom Sheet simplificado) ───────────────────

function JoinQueueSheet({
  isOpen,
  onClose,
  onJoin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (name: string, phone: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) return;
    onJoin(name.trim(), phone.trim());
    setName('');
    setPhone('');
    onClose();
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
            disabled={!name.trim() || !phone.trim()}
            className="w-full h-14 mt-6 rounded-2xl bg-brand-gold text-surface-900 font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:active:scale-100"
          >
            <UserPlus className="w-5 h-5" />
            Confirmar entrada
          </button>
        </div>
      </div>
    </>
  );
}

// ─── QueueModule (Componente Principal) ───────────────────────

export default function QueueModule() {
  const [queue, setQueue] = useState<QueueEntry[]>(MOCK_QUEUE);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const waitingEntries = queue.filter((e) => e.status === 'waiting');
  const inProgressEntry = queue.find((e) => e.status === 'in_progress');

  const handleJoin = (name: string, phone: string) => {
    const newEntry: QueueEntry = {
      id: crypto.randomUUID(),
      barbershop_id: 'shop-1',
      customer_name: name,
      whatsapp: { phone: phone.replace(/\D/g, '') },
      status: 'waiting',
      joined_at: new Date().toISOString(),
    };
    setQueue((prev) => [...prev, newEntry]);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Card de status */}
      <StatusCard
        totalWaiting={waitingEntries.length}
        avgTime={MOCK_AVG_TIME}
        hasInProgress={!!inProgressEntry}
      />

      {/* Lista da fila */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">
            Na fila
          </h2>
          <span className="text-xs text-surface-500">
            {queue.length} {queue.length === 1 ? 'pessoa' : 'pessoas'}
          </span>
        </div>

        <div className="space-y-2">
          {/* Em atendimento primeiro */}
          {inProgressEntry && (
            <QueueItem entry={inProgressEntry} position={0} />
          )}

          {/* Botão inline — sempre abaixo do atendimento atual */}
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="w-full h-14 rounded-2xl bg-brand-gold text-surface-900 font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 active:scale-[0.97] transition-all duration-150"
          >
            <UserPlus className="w-5 h-5" />
            Entrar na Fila
          </button>

          {/* Aguardando */}
          {waitingEntries.map((entry, index) => (
            <QueueItem
              key={entry.id}
              entry={entry}
              position={index + 1}
            />
          ))}

          {queue.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-sm text-surface-400">Ninguém na fila ainda</p>
              <p className="text-xs text-surface-500 mt-1">Seja o primeiro!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet */}
      <JoinQueueSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onJoin={handleJoin}
      />
    </div>
  );
}
