import { describe, it, expect } from 'vitest';
import { bodyRecordSchema } from '@/schemas/bodyRecord';

describe('bodyRecordSchema', () => {
  describe('date', () => {
    it('正常値: YYYY-MM-DD 形式を受け付ける', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70, body_fat: null });
      expect(result.success).toBe(true);
    });

    it('異常値: スラッシュ区切りは拒否する', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026/04/20', weight_kg: 70, body_fat: null });
      expect(result.success).toBe(false);
    });

    it('異常値: 空文字は拒否する', () => {
      const result = bodyRecordSchema.safeParse({ date: '', weight_kg: 70, body_fat: null });
      expect(result.success).toBe(false);
    });

    it('異常値: 文字列以外は拒否する', () => {
      const result = bodyRecordSchema.safeParse({ date: 20260420, weight_kg: 70, body_fat: null });
      expect(result.success).toBe(false);
    });
  });

  describe('weight_kg', () => {
    it('正常値: 範囲内の中間値を受け付ける', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70.5, body_fat: null });
      expect(result.success).toBe(true);
    });

    it('境界値: 20.0 は有効', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 20, body_fat: null });
      expect(result.success).toBe(true);
    });

    it('境界値: 300.0 は有効', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 300, body_fat: null });
      expect(result.success).toBe(true);
    });

    it('境界値: 19.9 は拒否する', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 19.9, body_fat: null });
      expect(result.success).toBe(false);
    });

    it('境界値: 300.1 は拒否する', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 300.1, body_fat: null });
      expect(result.success).toBe(false);
    });

    it('異常値: 文字列は拒否する', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: '70', body_fat: null });
      expect(result.success).toBe(false);
    });
  });

  describe('body_fat', () => {
    it('正常値: 範囲内の中間値を受け付ける', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70, body_fat: 20.5 });
      expect(result.success).toBe(true);
    });

    it('正常値: null を受け付ける（任意項目）', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70, body_fat: null });
      expect(result.success).toBe(true);
    });

    it('境界値: 3.0 は有効', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70, body_fat: 3 });
      expect(result.success).toBe(true);
    });

    it('境界値: 60.0 は有効', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70, body_fat: 60 });
      expect(result.success).toBe(true);
    });

    it('境界値: 2.9 は拒否する', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70, body_fat: 2.9 });
      expect(result.success).toBe(false);
    });

    it('境界値: 60.1 は拒否する', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70, body_fat: 60.1 });
      expect(result.success).toBe(false);
    });

    it('異常値: undefined は拒否する（null との区別）', () => {
      const result = bodyRecordSchema.safeParse({ date: '2026-04-20', weight_kg: 70, body_fat: undefined });
      expect(result.success).toBe(false);
    });
  });
});
