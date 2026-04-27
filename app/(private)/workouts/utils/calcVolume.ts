import type { WorkoutSet } from '../types';

// 総ボリューム = Σ(重量 × レップ数) で算出する
export function calcVolume(sets: Pick<WorkoutSet, 'weight_kg' | 'reps'>[]): number {
  return sets.reduce((total, set) => total + set.weight_kg * set.reps, 0);
}
