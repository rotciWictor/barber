import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueueService } from './queueService';
import { supabase } from '../core/supabase';

// Realizamos o mock do módulo inteiro
vi.mock('../core/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('QueueService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isAlreadyInQueue', () => {
    it('returns true if an active entry exists', async () => {
      // Mockamos o encadeamento de métodos do Supabase
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { id: '123' }, error: null });
      const mockIn = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEq2 = vi.fn().mockReturnValue({ in: mockIn });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await QueueService.isAlreadyInQueue('shop-id', 'user-id');
      
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('queue');
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq1).toHaveBeenCalledWith('barbershop_id', 'shop-id');
      expect(mockEq2).toHaveBeenCalledWith('clerk_user_id', 'user-id');
      expect(mockIn).toHaveBeenCalledWith('status', ['waiting', 'in_progress']);
    });

    it('returns false if no active entry exists', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockIn = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEq2 = vi.fn().mockReturnValue({ in: mockIn });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      const result = await QueueService.isAlreadyInQueue('shop-id', 'user-id');
      
      expect(result).toBe(false);
    });

    it('throws an error if supabase request fails', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
      const mockIn = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEq2 = vi.fn().mockReturnValue({ in: mockIn });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
      
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      await expect(QueueService.isAlreadyInQueue('shop-id', 'user-id')).rejects.toThrow('Erro ao verificar fila: Database error');
    });
  });
});
