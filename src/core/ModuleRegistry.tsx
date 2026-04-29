import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { ChapterId, SystemModule, ModuleRegistryState } from '../types/module';

// ─── Context Shape ────────────────────────────────────────────
interface ModuleRegistryContextValue extends ModuleRegistryState {
  /** Registra um novo módulo no sistema */
  registerModule: (module: SystemModule) => void;

  /** Ativa um capítulo para o usuário atual */
  activateChapter: (id: ChapterId) => void;

  /** Desativa um capítulo */
  deactivateChapter: (id: ChapterId) => void;

  /** Sincroniza os capítulos ativos (ex: vindo do Supabase) */
  syncActiveChapters: (ids: ChapterId[]) => void;

  /** Verifica se um capítulo está ativo */
  isChapterActive: (id: ChapterId) => boolean;

  /** Retorna os módulos ativos como array (para renderização) */
  getActiveModules: () => SystemModule[];
}

const ModuleRegistryContext = createContext<ModuleRegistryContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────
interface ModuleRegistryProviderProps {
  children: ReactNode;
}

export function ModuleRegistryProvider({ children }: ModuleRegistryProviderProps) {
  const [registeredModules, setRegisteredModules] = useState<Map<ChapterId, SystemModule>>(
    () => new Map(),
  );
  const [activeChapterIds, setActiveChapterIds] = useState<Set<ChapterId>>(
    () => new Set(),
  );

  const registerModule = useCallback((module: SystemModule) => {
    setRegisteredModules((prev) => {
      const next = new Map(prev);
      next.set(module.id, module);
      return next;
    });
  }, []);

  const activateChapter = useCallback((id: ChapterId) => {
    setActiveChapterIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const deactivateChapter = useCallback((id: ChapterId) => {
    setActiveChapterIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const syncActiveChapters = useCallback((ids: ChapterId[]) => {
    setActiveChapterIds(new Set(ids));
  }, []);

  const isChapterActive = useCallback(
    (id: ChapterId) => activeChapterIds.has(id),
    [activeChapterIds],
  );

  const getActiveModules = useCallback((): SystemModule[] => {
    const modules: SystemModule[] = [];
    for (const id of activeChapterIds) {
      const mod = registeredModules.get(id);
      if (mod) modules.push(mod);
    }
    return modules;
  }, [activeChapterIds, registeredModules]);

  const value = useMemo<ModuleRegistryContextValue>(
    () => ({
      registeredModules,
      activeChapterIds,
      registerModule,
      activateChapter,
      deactivateChapter,
      syncActiveChapters,
      isChapterActive,
      getActiveModules,
    }),
    [
      registeredModules,
      activeChapterIds,
      registerModule,
      activateChapter,
      deactivateChapter,
      syncActiveChapters,
      isChapterActive,
      getActiveModules,
    ],
  );

  return (
    <ModuleRegistryContext.Provider value={value}>
      {children}
    </ModuleRegistryContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
/**
 * Hook para acessar o registro de módulos.
 * Deve ser usado dentro de <ModuleRegistryProvider>.
 */
export function useModuleRegistry(): ModuleRegistryContextValue {
  const context = useContext(ModuleRegistryContext);
  if (!context) {
    throw new Error(
      'useModuleRegistry deve ser usado dentro de <ModuleRegistryProvider>',
    );
  }
  return context;
}
