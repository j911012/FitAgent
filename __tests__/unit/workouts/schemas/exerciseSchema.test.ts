import { describe, it, expect } from 'vitest';
import { exerciseSchema } from '@/app/(private)/workouts/schemas/exercise';

describe('exerciseSchema', () => {
  describe('name', () => {
    it('正常値: 通常の種目名を受け付ける', () => {
      const result = exerciseSchema.safeParse({ name: 'ベンチプレス', body_part: 'chest' });
      expect(result.success).toBe(true);
    });

    it('境界値: 1文字は有効', () => {
      const result = exerciseSchema.safeParse({ name: 'A', body_part: 'chest' });
      expect(result.success).toBe(true);
    });

    it('境界値: 50文字は有効', () => {
      const result = exerciseSchema.safeParse({ name: 'A'.repeat(50), body_part: 'chest' });
      expect(result.success).toBe(true);
    });

    it('境界値: 空文字は拒否する', () => {
      const result = exerciseSchema.safeParse({ name: '', body_part: 'chest' });
      expect(result.success).toBe(false);
    });

    it('境界値: 51文字は拒否する', () => {
      const result = exerciseSchema.safeParse({ name: 'A'.repeat(51), body_part: 'chest' });
      expect(result.success).toBe(false);
    });

    it('異常値: 数値型は拒否する', () => {
      const result = exerciseSchema.safeParse({ name: 123, body_part: 'chest' });
      expect(result.success).toBe(false);
    });
  });

  describe('body_part', () => {
    const validBodyParts = ['chest', 'back', 'shoulder', 'arm', 'leg', 'abs'] as const;

    it.each(validBodyParts)('正常値: %s は有効', (body_part) => {
      const result = exerciseSchema.safeParse({ name: 'テスト', body_part });
      expect(result.success).toBe(true);
    });

    it('異常値: 定義外の部位は拒否する', () => {
      const result = exerciseSchema.safeParse({ name: 'テスト', body_part: 'stomach' });
      expect(result.success).toBe(false);
    });

    it('異常値: 空文字は拒否する', () => {
      const result = exerciseSchema.safeParse({ name: 'テスト', body_part: '' });
      expect(result.success).toBe(false);
    });
  });
});
