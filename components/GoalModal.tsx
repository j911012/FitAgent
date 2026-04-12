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
  'flex-1 bg-white/[.06] border border-white/[.08] rounded-lg px-3 py-2 text-sm text-white/85 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500';

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm mx-4 rounded-2xl border border-white/[.08] p-6"
           style={{ background: '#0f0f1f' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[13px] font-medium text-white/85">目標を設定</h2>
          <button
            onClick={onClose}
            className="text-white/25 hover:text-white/60 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 目標体重 */}
        <div className="mb-3">
          <label className="block text-[11px] text-white/45 mb-1.5">
            目標体重
            <span className="ml-1 text-white/20">（任意）</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" step="0.1" min="20" max="300"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="70.0"
              className={inputCls}
            />
            <span className="text-[12px] text-white/35 w-6">kg</span>
          </div>
        </div>

        {/* 目標体脂肪率 */}
        <div className="mb-5">
          <label className="block text-[11px] text-white/45 mb-1.5">
            目標体脂肪率
            <span className="ml-1 text-white/20">（任意）</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" step="0.1" min="3" max="60"
              value={bodyFatInput}
              onChange={(e) => setBodyFatInput(e.target.value)}
              placeholder="15.0"
              className={inputCls}
            />
            <span className="text-[12px] text-white/35 w-6">%</span>
          </div>
        </div>

        {errorMessage && (
          <p className="text-red-400 text-[11px] mb-3">{errorMessage}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full rounded-[9px] py-2.5 text-[13px] font-medium text-white/92 transition-opacity disabled:opacity-50"
          style={{ background: 'rgba(124,58,237,0.55)' }}
        >
          {isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}
