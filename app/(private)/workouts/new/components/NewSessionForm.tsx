'use client';

import { useReducer, useTransition, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createWorkoutSessionAction } from '../../actions/workouts';
import ExerciseSelectModal from '../../components/ExerciseSelectModal';
import { ExerciseGroup } from '../../components/WorkoutFormFields';
import { workoutFormReducer } from '../../utils/workoutFormReducer';
import type { ExerciseDraft } from '../../utils/workoutFormReducer';
import { toDateString, formatDateJa } from '@/utils/date';

type WorkoutDraft = {
  date: string;
  exercises: ExerciseDraft[];
};

const DRAFT_KEY = 'workout-draft';

export default function NewSessionForm() {
  const today = toDateString(new Date());
  const [state, dispatch] = useReducer(workoutFormReducer, { exercises: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // 初回実行（復元）かどうかを判定するフラグ。refで管理することでsetStateをeffect内で呼ばない
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

      <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>
        {formatDateJa(new Date())}
      </p>

      {state.exercises.length > 0 && (
        <div className="flex flex-col gap-4">
          {state.exercises.map((ex) => (
            <ExerciseGroup key={ex.exercise.id} exerciseDraft={ex} dispatch={dispatch} />
          ))}
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-10 rounded-[10px] text-[13px] border border-dashed transition-colors"
        style={{ borderColor: 'var(--line)', color: 'var(--fg-4)' }}
      >
        + 種目を追加
      </button>

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
