import type { Exercise } from '../types';

export type SetDraft = {
  draftId: string;
  weight_kg: string;
  reps: string;
  memo: string;
};

export type ExerciseDraft = {
  exercise: Exercise;
  sets: SetDraft[];
};

export type FormState = {
  exercises: ExerciseDraft[];
};

export type Action =
  | { type: 'ADD_EXERCISE'; exercise: Exercise }
  | { type: 'REMOVE_EXERCISE'; exerciseId: string }
  | { type: 'ADD_SET'; exerciseId: string }
  | { type: 'REMOVE_SET'; exerciseId: string; draftId: string }
  | { type: 'UPDATE_SET'; exerciseId: string; draftId: string; field: keyof Pick<SetDraft, 'weight_kg' | 'reps' | 'memo'>; value: string }
  | { type: 'RESTORE'; exercises: ExerciseDraft[] };

export function makeSet(): SetDraft {
  return { draftId: crypto.randomUUID(), weight_kg: '', reps: '', memo: '' };
}

export function workoutFormReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'ADD_EXERCISE': {
      if (state.exercises.some((e) => e.exercise.id === action.exercise.id)) return state;
      return {
        ...state,
        exercises: [...state.exercises, { exercise: action.exercise, sets: [makeSet()] }],
      };
    }
    case 'REMOVE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter((e) => e.exercise.id !== action.exerciseId),
      };
    case 'ADD_SET':
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.exercise.id === action.exerciseId
            ? { ...e, sets: [...e.sets, makeSet()] }
            : e
        ),
      };
    case 'REMOVE_SET':
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.exercise.id === action.exerciseId
            ? { ...e, sets: e.sets.filter((s) => s.draftId !== action.draftId) }
            : e
        ),
      };
    case 'UPDATE_SET':
      return {
        ...state,
        exercises: state.exercises.map((e) =>
          e.exercise.id === action.exerciseId
            ? {
                ...e,
                sets: e.sets.map((s) =>
                  s.draftId === action.draftId ? { ...s, [action.field]: action.value } : s
                ),
              }
            : e
        ),
      };
    case 'RESTORE':
      return { exercises: action.exercises };
  }
}

// WorkoutSessionDetail の sets を ExerciseDraft[] に変換する
export function toExerciseDrafts(
  sets: { id: string; exercise_id: string; weight_kg: number; reps: number; memo: string | null; set_number: number; exercise: Exercise }[]
): ExerciseDraft[] {
  const map = new Map<string, ExerciseDraft>();
  // set_number 昇順で処理する（DBのORDER BYに依存しているが念のため）
  const sorted = [...sets].sort((a, b) => a.set_number - b.set_number);
  for (const set of sorted) {
    const draft: SetDraft = {
      draftId: set.id,
      weight_kg: set.weight_kg.toString(),
      reps: set.reps.toString(),
      memo: set.memo ?? '',
    };
    const existing = map.get(set.exercise_id);
    if (existing) {
      existing.sets.push(draft);
    } else {
      map.set(set.exercise_id, { exercise: set.exercise, sets: [draft] });
    }
  }
  return Array.from(map.values());
}
