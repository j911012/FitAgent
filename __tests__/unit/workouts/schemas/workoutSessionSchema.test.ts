import { describe, it, expect } from 'vitest';
import { workoutSessionSchema } from '@/app/(private)/workouts/schemas/workoutSession';

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const TOMORROW = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
// Zod v4 は RFC 4122 準拠の UUID を要求するため、バージョンビット(4)とバリアントビット(a)を含む形式を使う
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

const validSet = {
  exercise_id: VALID_UUID,
  set_number: 1,
  weight_kg: 60,
  reps: 10,
};

function makeSession(overrides: Record<string, unknown> = {}) {
  return { date: TODAY, sets: [validSet], ...overrides };
}

describe('workoutSessionSchema', () => {
  describe('date', () => {
    it('正常値: 今日の日付を受け付ける', () => {
      expect(workoutSessionSchema.safeParse(makeSession({ date: TODAY })).success).toBe(true);
    });

    it('正常値: 過去の日付を受け付ける', () => {
      expect(workoutSessionSchema.safeParse(makeSession({ date: YESTERDAY })).success).toBe(true);
    });

    it('異常値: 未来の日付は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSession({ date: TOMORROW })).success).toBe(false);
    });

    it('異常値: スラッシュ区切りは拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSession({ date: '2026/01/01' })).success).toBe(false);
    });

    it('異常値: 空文字は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSession({ date: '' })).success).toBe(false);
    });
  });

  describe('sets', () => {
    it('正常値: 1セットを受け付ける', () => {
      expect(workoutSessionSchema.safeParse(makeSession()).success).toBe(true);
    });

    it('異常値: 空配列は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSession({ sets: [] })).success).toBe(false);
    });
  });

  describe('sets[].weight_kg', () => {
    function makeSet(weight_kg: unknown) {
      return makeSession({ sets: [{ ...validSet, weight_kg }] });
    }

    it('境界値: 0 は有効', () => {
      expect(workoutSessionSchema.safeParse(makeSet(0)).success).toBe(true);
    });

    it('境界値: 1000 は有効', () => {
      expect(workoutSessionSchema.safeParse(makeSet(1000)).success).toBe(true);
    });

    it('境界値: -0.01 は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSet(-0.01)).success).toBe(false);
    });

    it('境界値: 1000.01 は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSet(1000.01)).success).toBe(false);
    });

    it('正常値: 0.01 単位の小数は有効', () => {
      expect(workoutSessionSchema.safeParse(makeSet(60.55)).success).toBe(true);
    });

    it('異常値: 0.001 単位は拒否する（multipleOf 0.01）', () => {
      expect(workoutSessionSchema.safeParse(makeSet(60.001)).success).toBe(false);
    });
  });

  describe('sets[].reps', () => {
    function makeSet(reps: unknown) {
      return makeSession({ sets: [{ ...validSet, reps }] });
    }

    it('境界値: 1 は有効', () => {
      expect(workoutSessionSchema.safeParse(makeSet(1)).success).toBe(true);
    });

    it('境界値: 1000 は有効', () => {
      expect(workoutSessionSchema.safeParse(makeSet(1000)).success).toBe(true);
    });

    it('境界値: 0 は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSet(0)).success).toBe(false);
    });

    it('境界値: 1001 は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSet(1001)).success).toBe(false);
    });

    it('異常値: 小数は拒否する（整数のみ）', () => {
      expect(workoutSessionSchema.safeParse(makeSet(10.5)).success).toBe(false);
    });
  });

  describe('sets[].set_number', () => {
    function makeSet(set_number: unknown) {
      return makeSession({ sets: [{ ...validSet, set_number }] });
    }

    it('境界値: 1 は有効', () => {
      expect(workoutSessionSchema.safeParse(makeSet(1)).success).toBe(true);
    });

    it('境界値: 0 は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSet(0)).success).toBe(false);
    });
  });

  describe('sets[].memo', () => {
    function makeSet(memo: unknown) {
      return makeSession({ sets: [{ ...validSet, memo }] });
    }

    it('正常値: 省略可（undefined）', () => {
      expect(workoutSessionSchema.safeParse(makeSession()).success).toBe(true);
    });

    it('境界値: 200文字は有効', () => {
      expect(workoutSessionSchema.safeParse(makeSet('A'.repeat(200))).success).toBe(true);
    });

    it('境界値: 201文字は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSet('A'.repeat(201))).success).toBe(false);
    });
  });

  describe('sets[].exercise_id', () => {
    function makeSet(exercise_id: unknown) {
      return makeSession({ sets: [{ ...validSet, exercise_id }] });
    }

    it('正常値: 有効なUUIDを受け付ける', () => {
      expect(workoutSessionSchema.safeParse(makeSet(VALID_UUID)).success).toBe(true);
    });

    it('異常値: UUID形式でない文字列は拒否する', () => {
      expect(workoutSessionSchema.safeParse(makeSet('not-a-uuid')).success).toBe(false);
    });
  });

  describe('重複チェック（exercise_id + set_number）', () => {
    const UUID_A = '550e8400-e29b-41d4-a716-446655440000';
    const UUID_B = '550e8400-e29b-41d4-a716-446655440001';

    it('異常値: 同一種目・同一set_numberは拒否する', () => {
      const session = makeSession({
        sets: [
          { ...validSet, exercise_id: UUID_A, set_number: 1 },
          { ...validSet, exercise_id: UUID_A, set_number: 1 },
        ],
      });
      expect(workoutSessionSchema.safeParse(session).success).toBe(false);
    });

    it('正常値: 同一種目・異なるset_numberは有効', () => {
      const session = makeSession({
        sets: [
          { ...validSet, exercise_id: UUID_A, set_number: 1 },
          { ...validSet, exercise_id: UUID_A, set_number: 2 },
        ],
      });
      expect(workoutSessionSchema.safeParse(session).success).toBe(true);
    });

    it('正常値: 異なる種目・同一set_numberは有効', () => {
      const session = makeSession({
        sets: [
          { ...validSet, exercise_id: UUID_A, set_number: 1 },
          { ...validSet, exercise_id: UUID_B, set_number: 1 },
        ],
      });
      expect(workoutSessionSchema.safeParse(session).success).toBe(true);
    });
  });
});
