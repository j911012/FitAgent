import type { Exercise, WorkoutSet } from '../types';

type SetWithExercise = WorkoutSet & { exercise: Exercise };

type ExerciseGroup = {
  exercise: Exercise;
  sets: WorkoutSet[];
};

// セット配列を種目ごとにグルーピングし、set_number 昇順で返す
export function groupSetsByExercise(sets: SetWithExercise[]): ExerciseGroup[] {
  const map = new Map<string, ExerciseGroup>();

  for (const set of sets) {
    const existing = map.get(set.exercise_id);
    if (existing) {
      existing.sets.push(set);
    } else {
      map.set(set.exercise_id, { exercise: set.exercise, sets: [set] });
    }
  }

  return Array.from(map.values()).map((group) => ({
    ...group,
    sets: group.sets.sort((a, b) => a.set_number - b.set_number),
  }));
}
