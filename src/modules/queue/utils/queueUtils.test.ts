import { describe, it, expect } from 'vitest';
import {
  getEstimatedWait,
  getWhatsAppLink,
  getWhatsAppNotifyLink,
  formatPhone,
} from './queueUtils';

describe('queueUtils', () => {
  describe('getEstimatedWait', () => {
    it('returns minutes when wait is less than an hour', () => {
      expect(getEstimatedWait(2, 20)).toBe('40 min');
      expect(getEstimatedWait(1, 30)).toBe('30 min');
    });

    it('returns hours when exactly a multiple of 60', () => {
      expect(getEstimatedWait(2, 30)).toBe('1h');
      expect(getEstimatedWait(4, 30)).toBe('2h');
    });

    it('returns hours and minutes for mixed times', () => {
      expect(getEstimatedWait(3, 30)).toBe('1h 30min');
      expect(getEstimatedWait(5, 25)).toBe('2h 5min');
    });
  });

  describe('getWhatsAppLink', () => {
    it('prepends +55 to the provided phone number', () => {
      expect(getWhatsAppLink('11999999999')).toBe('https://wa.me/5511999999999');
    });
  });

  describe('getWhatsAppNotifyLink', () => {
    it('generates the correct deep link for "called" type', () => {
      const link = getWhatsAppNotifyLink('11999999999', 'João', 'called');
      expect(link).toContain('https://wa.me/5511999999999');
      expect(link).toContain(encodeURIComponent('Sua vez chegou!'));
    });

    it('generates the correct deep link for "next" type', () => {
      const link = getWhatsAppNotifyLink('11999999999', 'Maria', 'next');
      expect(link).toContain('https://wa.me/5511999999999');
      expect(link).toContain(encodeURIComponent('Você é o próximo da fila'));
    });
  });

  describe('formatPhone', () => {
    it('formats 11 digits correctly', () => {
      expect(formatPhone('11988887777')).toBe('(11) 98888-7777');
    });

    it('formats partial input correctly', () => {
      expect(formatPhone('11988')).toBe('(11) 988');
      expect(formatPhone('11')).toBe('11');
      expect(formatPhone('1')).toBe('1');
    });

    it('strips non-numeric characters before formatting', () => {
      expect(formatPhone('(11) 9a88b8-7c777')).toBe('(11) 98887-777');
    });
  });
});
