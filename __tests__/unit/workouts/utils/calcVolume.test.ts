import { describe, it, expect } from 'vitest';
import { calcVolume } from '@/app/(private)/workouts/utils/calcVolume';

describe('calcVolume', () => {
  it('空配列は 0 を返す', () => {
    expect(calcVolume([])).toBe(0);
  });

  it('1件: 60kg × 10回 → 600', () => {
    expect(calcVolume([{ weight_kg: 60, reps: 10 }])).toBe(600);
  });

  it('複数件: [60×10, 70×8] → 1160', () => {
    expect(calcVolume([
      { weight_kg: 60, reps: 10 },
      { weight_kg: 70, reps: 8 },
    ])).toBe(1160);
  });

  it('重量 0kg は 0 を返す', () => {
    expect(calcVolume([{ weight_kg: 0, reps: 10 }])).toBe(0);
  });

  it('小数: 60.5kg × 10回 → 605', () => {
    expect(calcVolume([{ weight_kg: 60.5, reps: 10 }])).toBe(605);
  });
});
