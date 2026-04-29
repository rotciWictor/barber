/** Tabela: user_chapters */
export interface UserChapter {
  user_id: string;
  /** Identificador do módulo (ex: "vitrine", "retention") */
  chapter_id: string;
  is_active: boolean;
}
