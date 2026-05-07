import { supabase } from '../core/supabase';
import type { Barbershop } from '../types/barbershop';

/**
 * Camada de abstração sobre a tabela `barbershops`.
 * Nenhum componente React deve chamar o Supabase diretamente.
 */
export const BarbershopService = {
  /**
   * Busca dados da barbearia (sem expor o PIN).
   */
  async getShop(id: string): Promise<Barbershop> {
    const { data, error } = await supabase
      .from('barbershops')
      .select('id, name, is_open, avg_time_minutes')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Erro ao buscar barbearia: ${error.message}`);
    return data as Barbershop;
  },

  /**
   * Verifica se o PIN informado está correto.
   * Retorna true/false sem expor o PIN real.
   */
  async verifyPin(id: string, pin: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('barbershops')
      .select('id')
      .eq('id', id)
      .eq('pin', pin)
      .maybeSingle();

    if (error) throw new Error(`Erro ao verificar PIN: ${error.message}`);
    return data !== null;
  },

  /**
   * Alterna o status aberto/fechado da barbearia.
   */
  async toggleOpen(id: string, isOpen: boolean): Promise<void> {
    const { error } = await supabase
      .from('barbershops')
      .update({ is_open: isOpen })
      .eq('id', id);

    if (error) throw new Error(`Erro ao alterar status: ${error.message}`);
  },
} as const;
