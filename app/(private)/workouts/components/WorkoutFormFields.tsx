'use client';

import type { Action, ExerciseDraft, SetDraft } from '../utils/workoutFormReducer';

// ---- ExerciseGroup ----

export function ExerciseGroup({
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

export function SetRow({
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
