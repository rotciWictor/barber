import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// ─── Variáveis de ambiente obrigatórias ───────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Variáveis de ambiente ausentes. ' +
    'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
  );
}

/**
 * Cliente Supabase tipado.
 * Singleton reutilizado em toda a aplicação via camada /services.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
