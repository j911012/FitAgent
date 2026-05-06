'use client';

import { useReducer, useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateWorkoutSessionAction, deleteWorkoutSessionAction } from '../../actions/workouts';
import ExerciseSelectModal from '../../components/ExerciseSelectModal';
import { ExerciseGroup } from '../../components/WorkoutFormFields';
import { workoutFormReducer, toExerciseDrafts } from '../../utils/workoutFormReducer';
import { formatDateJa } from '@/utils/date';
import type { WorkoutSessionDetail } from '../../types';

type Props = {
  sessionDetail: WorkoutSessionDetail;
};

export default function EditSessionForm({ sessionDetail }: Props) {
  const [state, dispatch] = useReducer(workoutFormReducer, {
    exercises: toExerciseDrafts(sessionDetail.sets),
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  // 'YYYY-MM-DD' → Date（new Date(str) はUTC扱いになるためローカル時刻で生成）
  const [year, month, day] = sessionDetail.date.split('-').map(Number);
  const sessionDate = new Date(year, month - 1, day);

  function handleSave() {
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
      const result = await updateWorkoutSessionAction(sessionDetail.id, {
        date: sessionDetail.date,
        sets,
      });
      if (result.isSuccess) {
        router.refresh();
      } else {
        setErrorMessage(result.errorMessage);
      }
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteWorkoutSessionAction(sessionDetail.id);
      if (result.isSuccess) {
        router.push('/workouts');
      } else {
        setErrorMessage(result.errorMessage);
        setIsDeleteModalOpen(false);
      }
    });
  }

  return (
    <>
      {/* ヘッダー: 削除モーダルのトリガーとフォームで状態を共有するためEditSessionForm内に含める */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/workouts"
            className="text-[13px] transition-colors"
            style={{ color: 'var(--fg-4)' }}
          >
            ← 戻る
          </Link>
          <h1 className="text-[17px] font-bold" style={{ color: 'var(--fg)' }}>
            セッション編集
          </h1>
        </div>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-[13px] px-3 py-1.5 rounded-[8px] transition-colors"
          style={{ color: 'var(--fg-3)', background: 'rgba(255,255,255,0.05)' }}
        >
          削除
        </button>
      </div>

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
          {formatDateJa(sessionDate)}
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
          onClick={handleSave}
          disabled={isPending || state.exercises.length === 0}
          className="w-full h-11 rounded-[10px] text-[14px] font-semibold text-white disabled:opacity-40 transition-opacity"
          style={{ background: 'linear-gradient(135deg, var(--red) 0%, var(--purple) 100%)' }}
        >
          {isPending ? '保存中...' : '保存'}
        </button>

        <ExerciseSelectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={(exercise) => dispatch({ type: 'ADD_EXERCISE', exercise })}
        />
      </div>

      {/* 削除確認モーダル */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsDeleteModalOpen(false); }}
        >
          <div
            className="hidden md:flex items-center justify-center h-full"
            onClick={(e) => { if (e.target === e.currentTarget) setIsDeleteModalOpen(false); }}
          >
            <div
              className="w-full max-w-sm mx-4 p-[18px] rounded-[22px]"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
            >
              <DeleteModalContent
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                isDeleting={isDeleting}
              />
            </div>
          </div>
          <div
            className="md:hidden fixed left-4 right-4 bottom-[30px] rounded-[22px] p-[18px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
          >
            <DeleteModalContent
              onConfirm={handleDelete}
              onCancel={() => setIsDeleteModalOpen(false)}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      )}
    </>
  );
}

function DeleteModalContent({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <>
      <h2 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--fg)' }}>
        セッションを削除しますか？
      </h2>
      <p className="text-[13px] mb-5" style={{ color: 'var(--fg-3)' }}>
        この操作は取り消せません。セッションに含まれるすべてのセット記録も削除されます。
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onCancel}
          className="h-12 rounded-[14px] text-[15px] font-semibold"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--fg)' }}
        >
          キャンセル
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="h-12 rounded-[14px] text-[15px] font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--red)' }}
        >
          {isDeleting ? '削除中...' : '削除'}
        </button>
      </div>
    </>
  );
}
