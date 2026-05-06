'use client';

import { useReducer, useTransition, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createWorkoutSessionAction } from '../../actions/workouts';
import ExerciseSelectModal from '../../components/ExerciseSelectModal';
import { toDateString, formatDateJa } from '@/utils/date';
import type { Exercise } from '../../types';

// ---- 型 ----

type SetDraft = {
  draftId: string;
  weight_kg: string;
  reps: string;
  memo: string;
};

type ExerciseDraft = {
  exercise: Exercise;
  sets: SetDraft[];
};

type FormState = {
  exercises: ExerciseDraft[];
};

type WorkoutDraft = {
  date: string;
  exercises: ExerciseDraft[];
};

type Action =
  | { type: 'ADD_EXERCISE'; exercise: Exercise }
  | { type: 'REMOVE_EXERCISE'; exerciseId: string }
  | { type: 'ADD_SET'; exerciseId: string }
  | { type: 'REMOVE_SET'; exerciseId: string; draftId: string }
  | { type: 'UPDATE_SET'; exerciseId: string; draftId: string; field: keyof Pick<SetDraft, 'weight_kg' | 'reps' | 'memo'>; value: string }
  | { type: 'RESTORE'; exercises: ExerciseDraft[] };

const DRAFT_KEY = 'workout-draft';

// ---- Reducer ----

function makeSet(): SetDraft {
  return { draftId: crypto.randomUUID(), weight_kg: '', reps: '', memo: '' };
}

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'ADD_EXERCISE': {
      // 同一種目は1グループのみ許可（重複追加はサイレントに無視）
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

// ---- メインコンポーネント ----

export default function NewSessionForm() {
  const today = toDateString(new Date());
  const [state, dispatch] = useReducer(reducer, { exercises: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // 初回実行（復元）かどうかを判定するフラグ。stateではなくrefで管理することでsetStateをeffect内で呼ばない
  const isFirstRun = useRef(true);
  const router = useRouter();

  // 初回: localStorage から復元する（復元によるstate変化が次回実行を引き起こす）
  // 2回目以降: 種目・セットの変化を自動保存する
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw) as WorkoutDraft;
          if (draft.date === today) {
            dispatch({ type: 'RESTORE', exercises: draft.exercises });
          }
        }
      } catch {}
      return; // 復元によるstate変化が再度このeffectを呼ぶため、ここでは保存しない
    }

    try {
      if (state.exercises.length === 0) {
        localStorage.removeItem(DRAFT_KEY);
      } else {
        const draft: WorkoutDraft = { date: today, exercises: state.exercises };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      }
    } catch {}
  }, [state.exercises, today]);

  function handleComplete() {
    setErrorMessage(null);
    // ExerciseDraft の配列を WorkoutSetInput のフラット配列に変換する
    const sets = state.exercises.flatMap((ex) =>
      ex.sets.map((set, idx) => ({
        exercise_id: ex.exercise.id,
        set_number: idx + 1,
        weight_kg: parseFloat(set.weight_kg),
        reps: parseInt(set.reps, 10),
        memo: set.memo || undefined,
      }))
    );

    startTransition(async () => {
      const result = await createWorkoutSessionAction({ date: today, sets });
      if (result.isSuccess) {
        localStorage.removeItem(DRAFT_KEY);
        router.push(`/workouts/${result.data.id}`);
      } else {
        setErrorMessage(result.errorMessage);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {errorMessage && (
        <p
          className="text-[13px] px-4 py-3 rounded-[8px]"
          style={{ background: 'rgba(255,80,80,0.08)', color: 'var(--red)', border: '1px solid rgba(255,80,80,0.2)' }}
        >
          {errorMessage}
        </p>
      )}

      {/* 今日の日付（変更不可） */}
      <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>
        {formatDateJa(new Date())}
      </p>

      {/* 種目リスト */}
      {state.exercises.length > 0 && (
        <div className="flex flex-col gap-4">
          {state.exercises.map((ex) => (
            <ExerciseGroup key={ex.exercise.id} exerciseDraft={ex} dispatch={dispatch} />
          ))}
        </div>
      )}

      {/* 種目追加ボタン */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-10 rounded-[10px] text-[13px] border border-dashed transition-colors"
        style={{ borderColor: 'var(--line)', color: 'var(--fg-4)' }}
      >
        + 種目を追加
      </button>

      {/* 完了ボタン */}
      <button
        onClick={handleComplete}
        disabled={isPending || state.exercises.length === 0}
        className="w-full h-11 rounded-[10px] text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity"
        style={{ background: 'linear-gradient(135deg, var(--red) 0%, var(--purple) 100%)' }}
      >
        {isPending ? '保存中...' : '完了'}
      </button>

      <ExerciseSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(exercise) => dispatch({ type: 'ADD_EXERCISE', exercise })}
      />
    </div>
  );
}

// ---- ExerciseGroup ----

function ExerciseGroup({
  exerciseDraft,
  dispatch,
}: {
  exerciseDraft: ExerciseDraft;
  dispatch: React.Dispatch<Action>;
}) {
  const { exercise, sets } = exerciseDraft;

  return (
    <div
      className="rounded-[12px] p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-medium" style={{ color: 'var(--fg)' }}>
          {exercise.name}
        </span>
        <button
          onClick={() => dispatch({ type: 'REMOVE_EXERCISE', exerciseId: exercise.id })}
          className="text-[12px] transition-colors hover:text-(--red)"
          style={{ color: 'var(--fg-4)' }}
        >
          種目を削除
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {sets.map((set, idx) => (
          <SetRow
            key={set.draftId}
            setNumber={idx + 1}
            set={set}
            exerciseId={exercise.id}
            canRemove={sets.length > 1}
            dispatch={dispatch}
          />
        ))}
      </div>

      <button
        onClick={() => dispatch({ type: 'ADD_SET', exerciseId: exercise.id })}
        className="mt-3 text-[12px] transition-colors hover:text-white"
        style={{ color: 'var(--fg-4)' }}
      >
        + セットを追加
      </button>
    </div>
  );
}

// ---- SetRow ----

function SetRow({
  setNumber,
  set,
  exerciseId,
  canRemove,
  dispatch,
}: {
  setNumber: number;
  set: SetDraft;
  exerciseId: string;
  canRemove: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  function update(field: 'weight_kg' | 'reps' | 'memo', value: string) {
    dispatch({ type: 'UPDATE_SET', exerciseId, draftId: set.draftId, field, value });
  }

  const inputCls = 'h-8 px-2 rounded-[6px] text-[13px] bg-transparent border outline-none';
  const inputStyle = { borderColor: 'var(--line)', color: 'var(--fg)' } as const;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] w-6 shrink-0 text-right" style={{ color: 'var(--fg-4)' }}>
        {setNumber}
      </span>
      <input
        type="number"
        step="0.5"
        min="0"
        value={set.weight_kg}
        onChange={(e) => update('weight_kg', e.target.value)}
        placeholder="kg"
        className={`${inputCls} w-16 text-center`}
        style={inputStyle}
      />
      <span className="text-[12px] shrink-0" style={{ color: 'var(--fg-4)' }}>×</span>
      <input
        type="number"
        step="1"
        min="1"
        value={set.reps}
        onChange={(e) => update('reps', e.target.value)}
        placeholder="回"
        className={`${inputCls} w-14 text-center`}
        style={inputStyle}
      />
      <input
        type="text"
        value={set.memo}
        onChange={(e) => update('memo', e.target.value)}
        placeholder="メモ"
        className={`${inputCls} flex-1 min-w-0`}
        style={inputStyle}
      />
      {canRemove && (
        <button
          onClick={() => dispatch({ type: 'REMOVE_SET', exerciseId, draftId: set.draftId })}
          className="shrink-0 text-[13px] transition-colors hover:text-(--red)"
          style={{ color: 'var(--fg-4)' }}
          aria-label="セットを削除"
        >
          ✕
        </button>
      )}
    </div>
  );
}
