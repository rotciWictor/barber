import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * Identificadores dos módulos (Capítulos) disponíveis no sistema.
 * Cada novo módulo deve ser adicionado aqui.
 */
export type ChapterId = 'vitrine' | 'retention' | 'analytics' | 'ai_voice';

/**
 * Definição de um módulo injetável no sistema.
 * Segue o "Telltale DLC Pattern": cada capítulo é independente
 * e pode ser ativado/desativado via Feature Flag.
 */
export interface SystemModule {
  /** Identificador único do módulo */
  id: ChapterId;

  /** Nome de exibição na UI (PT-BR) */
  label: string;

  /** Descrição curta do módulo (PT-BR) */
  description: string;

  /** Ícone do módulo (nome do ícone Lucide) */
  icon: string;

  /**
   * Componente React carregado via lazy loading.
   * Permite code-splitting por módulo.
   */
  component: LazyExoticComponent<ComponentType>;

  /** Rota onde o módulo é montado (ex: "/vitrine") */
  route: string;

  /** Se o módulo requer alguma dependência de outro módulo */
  dependencies?: ChapterId[];
}

/**
 * Estado do registro de módulos.
 * Usado pelo ModuleRegistry para controlar quais capítulos estão ativos.
 */
export interface ModuleRegistryState {
  /** Mapa de todos os módulos registrados no sistema */
  registeredModules: Map<ChapterId, SystemModule>;

  /** Set de IDs dos módulos ativos para o usuário atual */
  activeChapterIds: Set<ChapterId>;
}
