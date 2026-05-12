import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  let consoleDebugSpy: any;
  let consoleInfoSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats and calls console.debug for debug messages', () => {
    logger.debug('Test debug message', { category: 'Queue' });
    expect(consoleDebugSpy).toHaveBeenCalled();
    const args = consoleDebugSpy.mock.calls[0];
    expect(args[0]).toContain('DEBUG');
    expect(args[0]).toContain('[Queue] Test debug message');
  });

  it('formats and calls console.info for info messages', () => {
    logger.info('Test info message');
    expect(consoleInfoSpy).toHaveBeenCalled();
    const args = consoleInfoSpy.mock.calls[0];
    expect(args[0]).toContain('INFO');
    expect(args[0]).toContain('[App] Test info message');
  });

  it('formats and calls console.warn for warn messages', () => {
    logger.warn('Test warn message');
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('formats and calls console.error for error messages', () => {
    const mockError = new Error('Database connection failed');
    logger.error('Test error message', { error: mockError, category: 'Supabase' });
    expect(consoleErrorSpy).toHaveBeenCalled();
    const args = consoleErrorSpy.mock.calls[0];
    expect(args[0]).toContain('ERROR');
    expect(args[0]).toContain('[Supabase] Test error message');
    expect(args).toContain(mockError);
  });
});
