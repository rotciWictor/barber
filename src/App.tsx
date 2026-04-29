import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModuleRegistryProvider } from './core/ModuleRegistry';
import { Scissors } from 'lucide-react';

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

// ─── Shell Principal da Aplicação ─────────────────────────────
function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header minimalista */}
      <header className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-md border-b border-surface-700/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-brand-gold" />
            <h1 className="text-base font-semibold text-surface-100 tracking-tight">
              Gerente da Cadeira
            </h1>
          </div>

          {/* Semáforo de status — será conectado ao estado real */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-status-closed" />
            <span className="text-xs text-surface-400">Fechado</span>
          </div>
        </div>
      </header>

      {/* Área de conteúdo principal */}
      <main className="flex-1 px-4 py-6">
        <div className="animate-fade-in">
          <div className="rounded-2xl bg-surface-800 border border-surface-700/50 p-6">
            <h2 className="text-lg font-semibold text-surface-100 mb-2">
              Bem-vindo 👋
            </h2>
            <p className="text-sm text-surface-400 leading-relaxed">
              Seu sistema de gestão está pronto. Os módulos serão
              carregados conforme ativados no seu plano.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom nav placeholder — será expandido com módulos */}
      <nav className="sticky bottom-0 z-50 bg-surface-900/90 backdrop-blur-md border-t border-surface-700/50">
        <div className="flex items-center justify-around h-16">
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-brand-gold min-w-[64px] min-h-[48px] justify-center"
          >
            <Scissors className="w-5 h-5" />
            <span className="text-[10px] font-medium">Início</span>
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
