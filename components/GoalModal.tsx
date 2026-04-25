'use client';

import { useState, useTransition } from 'react';
import type { Goal } from '@/types';
import { upsertGoalAction } from '@/actions/goals';

type Props = {
  isOpen: boolean;
  goal: Goal | null;
  onClose: () => void;
};

const inputCls =
  'flex-1 rounded-[12px] px-3 py-2 text-sm placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[var(--red)] focus:border-[var(--red)]';
const inputStyle = { background: 'var(--bg-3)', border: '1px solid var(--line)', color: 'var(--fg)' } as const;

// 目標設定モーダル（ダークテーマ）
export default function GoalModal({ isOpen, goal, onClose }: Props) {
  // key prop による再マウントでリセットされるため、初期値を直接 goal から設定する
  const [weightInput, setWeightInput] = useState(goal?.target_weight_kg != null ? goal.target_weight_kg.toFixed(1) : '');
  const [bodyFatInput, setBodyFatInput] = useState(goal?.target_body_fat != null ? goal.target_body_fat.toFixed(1) : '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit() {
    const target_weight_kg = weightInput !== '' ? parseFloat(weightInput) : null;
    const target_body_fat = bodyFatInput !== '' ? parseFloat(bodyFatInput) : null;

    if (weightInput !== '' && isNaN(target_weight_kg!)) {
      setErrorMessage('目標体重に正しい数値を入力してください');
      return;
    }
    if (bodyFatInput !== '' && isNaN(target_body_fat!)) {
      setErrorMessage('目標体脂肪率に正しい数値を入力してください');
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await upsertGoalAction({ target_weight_kg, target_body_fat });
      if (result.isSuccess) {
        onClose();
      } else {
        setErrorMessage(result.errorMessage);
      }
    });
  }

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--fg)' }}>目標を設定</h2>
        <button
          onClick={onClose}
          className="transition-colors"
          style={{ color: 'var(--fg-3)' }}
          aria-label="閉じる"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 目標体重 */}
      <div className="mb-2.5">
        <label className="block text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>
          目標体重<span className="ml-1" style={{ color: 'var(--fg-4)' }}>（任意）</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number" step="0.1" min="20" max="300"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="70.0"
            className={inputCls}
            style={inputStyle}
          />
          <span className="text-[12px] w-6" style={{ color: 'var(--fg-3)' }}>kg</span>
        </div>
      </div>

      {/* 目標体脂肪率 */}
      <div className="mb-4">
        <label className="block text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>
          目標体脂肪率<span className="ml-1" style={{ color: 'var(--fg-4)' }}>（任意）</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number" step="0.1" min="3" max="60"
            value={bodyFatInput}
            onChange={(e) => setBodyFatInput(e.target.value)}
            placeholder="15.0"
            className={inputCls}
            style={inputStyle}
          />
          <span className="text-[12px] w-6" style={{ color: 'var(--fg-3)' }}>%</span>
        </div>
      </div>

      {errorMessage && (
        <p className="text-[11px] mb-3" style={{ color: 'var(--red)' }}>{errorMessage}</p>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onClose}
          className="h-12 rounded-[14px] text-[15px] font-semibold"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', color: 'var(--fg)' }}
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="h-12 rounded-[14px] text-[15px] font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--red)', boxShadow: '0 10px 24px oklch(0.68 0.22 18 / 0.35)' }}
        >
          {isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </>
  );

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* PC（md以上）: 中央モーダル */}
      <div
        className="hidden md:flex items-center justify-center h-full"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="w-full max-w-sm mx-4 p-[18px] rounded-[22px]"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
        >
          {content}
        </div>
      </div>

      {/* SP（md未満）: ボトムシート */}
      <div
        className="md:hidden fixed left-4 right-4 bottom-[30px] rounded-[22px] p-[18px]"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--line-2)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
      >
        {content}
      </div>
    </div>
  );
}
