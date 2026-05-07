import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewMode = 'customer' | 'barber';

interface AppState {
  /** Modo atual: cliente (padrão) ou barbeiro (desbloqueado via PIN) */
  viewMode: ViewMode;

  /** Desbloqueia o modo barbeiro */
  unlock: () => void;

  /** Volta para o modo cliente */
  lock: () => void;
}

/**
 * Store global da aplicação.
 * Persiste via localStorage — ao fechar e reabrir o app,
 * o barbeiro continua no modo gerente sem precisar digitar o PIN de novo.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      viewMode: 'customer',
      unlock: () => set({ viewMode: 'barber' }),
      lock: () => set({ viewMode: 'customer' }),
    }),
    { name: 'gerente-da-cadeira' },
  ),
);
