import { describe, it, expect } from 'vitest';
import { goalSchema } from '@/schemas/goal';

describe('goalSchema', () => {
  describe('target_weight_kg', () => {
    it('正常値: 範囲内の中間値を受け付ける', () => {
      const result = goalSchema.safeParse({ target_weight_kg: 65.0, target_body_fat: null });
      expect(result.success).toBe(true);
    });

    it('正常値: null を受け付ける（任意項目）', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: null });
      expect(result.success).toBe(true);
    });

    it('境界値: 20.0 は有効', () => {
      const result = goalSchema.safeParse({ target_weight_kg: 20, target_body_fat: null });
      expect(result.success).toBe(true);
    });

    it('境界値: 300.0 は有効', () => {
      const result = goalSchema.safeParse({ target_weight_kg: 300, target_body_fat: null });
      expect(result.success).toBe(true);
    });

    it('境界値: 19.9 は拒否する', () => {
      const result = goalSchema.safeParse({ target_weight_kg: 19.9, target_body_fat: null });
      expect(result.success).toBe(false);
    });

    it('境界値: 300.1 は拒否する', () => {
      const result = goalSchema.safeParse({ target_weight_kg: 300.1, target_body_fat: null });
      expect(result.success).toBe(false);
    });

    it('異常値: 文字列は拒否する', () => {
      const result = goalSchema.safeParse({ target_weight_kg: '65', target_body_fat: null });
      expect(result.success).toBe(false);
    });

    it('異常値: undefined は拒否する（null との区別）', () => {
      const result = goalSchema.safeParse({ target_weight_kg: undefined, target_body_fat: null });
      expect(result.success).toBe(false);
    });
  });

  describe('target_body_fat', () => {
    it('正常値: 範囲内の中間値を受け付ける', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: 20.0 });
      expect(result.success).toBe(true);
    });

    it('正常値: null を受け付ける（任意項目）', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: null });
      expect(result.success).toBe(true);
    });

    it('境界値: 3.0 は有効', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: 3 });
      expect(result.success).toBe(true);
    });

    it('境界値: 60.0 は有効', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: 60 });
      expect(result.success).toBe(true);
    });

    it('境界値: 2.9 は拒否する', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: 2.9 });
      expect(result.success).toBe(false);
    });

    it('境界値: 60.1 は拒否する', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: 60.1 });
      expect(result.success).toBe(false);
    });

    it('異常値: 文字列は拒否する', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: '20' });
      expect(result.success).toBe(false);
    });
  });

  describe('両フィールド同時', () => {
    it('正常値: 両方に有効な値を設定できる', () => {
      const result = goalSchema.safeParse({ target_weight_kg: 65, target_body_fat: 20 });
      expect(result.success).toBe(true);
    });

    it('正常値: 両方 null でも有効（片方だけ設定も可能）', () => {
      const result = goalSchema.safeParse({ target_weight_kg: null, target_body_fat: null });
      expect(result.success).toBe(true);
    });
  });
});
