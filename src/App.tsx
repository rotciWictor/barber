import { Suspense } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Show, UserButton } from '@clerk/react';
import { ModuleRegistryProvider } from './core/ModuleRegistry';
import { Scissors, Users } from 'lucide-react';
import { BarbershopService } from './services/barbershopService';
import { useAppStore } from './store/useAppStore';
import QueueModule from './modules/queue/QueueModule';

// ─── Constants ────────────────────────────────────────────────
const SHOP_ID = '00000000-0000-0000-0000-000000000001';

// ─── React Query — Config otimizada para mobile ──────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min — reduz refetch em mobile
      retry: 2,
      refetchOnWindowFocus: false, // PWA: evita refetch ao voltar do background
    },
  },
});

// ─── Fallback de carregamento (usado pelo Suspense dos módulos) ──
function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center animate-pulse">
          <Scissors className="w-8 h-8 text-brand-gold" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-brand-gold/30 animate-ping" />
      </div>
      <p className="text-surface-400 text-sm tracking-wide">Carregando...</p>
    </div>
  );
}

// ─── Header com semáforo funcional + perfil Clerk ─────────────
function AppHeader() {
  const viewMode = useAppStore((s) => s.viewMode);
  const qc = useQueryClient();

  const { data: shop } = useQuery({
    queryKey: ['shop', SHOP_ID],
    queryFn: () => BarbershopService.getShop(SHOP_ID),
  });

  const toggleMutation = useMutation({
    mutationFn: (newState: boolean) => BarbershopService.toggleOpen(SHOP_ID, newState),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop', SHOP_ID] }),
  });

  const isOpen = shop?.is_open ?? false;
  const isBarber = viewMode === 'barber';

  const handleToggle = () => {
    if (!isBarber) return;
    toggleMutation.mutate(!isOpen);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-900/80 backdrop-blur-md border-b border-surface-700/50">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-brand-gold" />
          <h1 className="text-base font-semibold text-surface-100 tracking-tight">
            {shop?.name ?? 'Gerente da Cadeira'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Semáforo aberto/fechado */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={!isBarber || toggleMutation.isPending}
            className={`
              flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-all
              ${isBarber ? 'cursor-pointer active:scale-95' : 'cursor-default'}
            `}
            aria-label={isOpen ? 'Fechar fila' : 'Abrir fila'}
          >
            <div
              className={`
                w-2.5 h-2.5 rounded-full transition-colors
                ${isOpen ? 'bg-status-open animate-pulse-glow' : 'bg-status-closed'}
              `}
            />
            <span className={`text-xs ${isOpen ? 'text-status-open' : 'text-surface-400'}`}>
              {isOpen ? 'Aberto' : 'Fechado'}
            </span>
          </button>

          {/* Avatar do usuário Clerk (quando logado) */}
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}

// ─── Shell Principal da Aplicação ─────────────────────────────
function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col">
      <AppHeader />

      {/* Área de conteúdo principal — Módulo da Fila */}
      <main className="flex-1 px-4 py-4 pb-20">
        <QueueModule />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-900/90 backdrop-blur-md border-t border-surface-700/50">
        <div className="flex items-center justify-around h-16">
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-surface-400 min-w-[64px] min-h-[48px] justify-center"
          >
            <Scissors className="w-5 h-5" />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-brand-gold min-w-[64px] min-h-[48px] justify-center"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">Fila</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// ─── App Root (Provider Tree) ─────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ModuleRegistryProvider>
        <Suspense fallback={<LoadingFallback />}>
          <AppShell />
        </Suspense>
      </ModuleRegistryProvider>
    </QueryClientProvider>
  );
}
