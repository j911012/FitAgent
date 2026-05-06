import { describe, it, expect } from 'vitest';
import { groupSetsByExercise } from '@/app/(private)/workouts/utils/groupSetsByExercise';
import type { Exercise, WorkoutSet } from '@/app/(private)/workouts/types';

const baseExercise = (id: string, name: string): Exercise => ({
  id,
  user_id: null,
  name,
  body_part: 'chest',
  is_default: true,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
});

const baseSet = (overrides: Partial<WorkoutSet> & { exercise_id: string; set_number: number }): WorkoutSet & { exercise: Exercise } => ({
  id: crypto.randomUUID(),
  user_id: 'user-1',
  session_id: 'session-1',
  weight_kg: 60,
  reps: 10,
  memo: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  exercise: baseExercise(overrides.exercise_id, 'テスト種目'),
  ...overrides,
});

const EX_A = '550e8400-e29b-41d4-a716-446655440000';
const EX_B = '550e8400-e29b-41d4-a716-446655440001';

describe('groupSetsByExercise', () => {
  it('空配列は空配列を返す', () => {
    expect(groupSetsByExercise([])).toEqual([]);
  });

  it('1種目・1セット: 正しくグループ化される', () => {
    const sets = [baseSet({ exercise_id: EX_A, set_number: 1 })];
    const result = groupSetsByExercise(sets);

    expect(result).toHaveLength(1);
    expect(result[0].exercise.id).toBe(EX_A);
    expect(result[0].sets).toHaveLength(1);
  });

  it('1種目・複数セット: 同一グループにまとまる', () => {
    const sets = [
      baseSet({ exercise_id: EX_A, set_number: 1 }),
      baseSet({ exercise_id: EX_A, set_number: 2 }),
      baseSet({ exercise_id: EX_A, set_number: 3 }),
    ];
    const result = groupSetsByExercise(sets);

    expect(result).toHaveLength(1);
    expect(result[0].sets).toHaveLength(3);
  });

  it('複数種目: 種目ごとに分かれる', () => {
    const sets = [
      baseSet({ exercise_id: EX_A, set_number: 1 }),
      baseSet({ exercise_id: EX_B, set_number: 1 }),
    ];
    const result = groupSetsByExercise(sets);

    expect(result).toHaveLength(2);
    expect(result[0].exercise.id).toBe(EX_A);
    expect(result[1].exercise.id).toBe(EX_B);
  });

  it('set_number が逆順でも昇順にソートされる', () => {
    const sets = [
      baseSet({ exercise_id: EX_A, set_number: 3 }),
      baseSet({ exercise_id: EX_A, set_number: 1 }),
      baseSet({ exercise_id: EX_A, set_number: 2 }),
    ];
    const result = groupSetsByExercise(sets);
    const setNumbers = result[0].sets.map((s) => s.set_number);

    expect(setNumbers).toEqual([1, 2, 3]);
  });

  it('同一種目のセットが散在していても正しく集約される', () => {
    const sets = [
      baseSet({ exercise_id: EX_A, set_number: 1 }),
      baseSet({ exercise_id: EX_B, set_number: 1 }),
      baseSet({ exercise_id: EX_A, set_number: 2 }),
      baseSet({ exercise_id: EX_B, set_number: 2 }),
    ];
    const result = groupSetsByExercise(sets);

    expect(result).toHaveLength(2);
    expect(result.find((g) => g.exercise.id === EX_A)?.sets).toHaveLength(2);
    expect(result.find((g) => g.exercise.id === EX_B)?.sets).toHaveLength(2);
  });
});
