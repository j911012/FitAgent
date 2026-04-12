'use client';

import { useState, useTransition } from 'react';
import type { BodyRecord } from '@/types';
import { upsertBodyRecordAction } from '@/actions/bodyRecords';
import { toDateString } from '@/utils/date';

type Props = {
  isOpen: boolean;
  record: BodyRecord | null;
  onClose: () => void;
};

const inputCls =
  'flex-1 bg-white/[.06] border border-white/[.08] rounded-lg px-3 py-2 text-sm text-white/85 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500';

// 体重記録の登録・編集モーダル（ダークテーマ）
export default function RecordModal({ isOpen, record, onClose }: Props) {
  // key prop による再マウントでリセットされるため、初期値を直接 record から設定する
  const [weightInput, setWeightInput] = useState(record ? record.weight_kg.toFixed(1) : '');
  const [bodyFatInput, setBodyFatInput] = useState(record?.body_fat != null ? record.body_fat.toFixed(1) : '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const date = record ? record.date : toDateString(new Date());

  function handleSubmit() {
    const weight_kg = parseFloat(weightInput);
    if (isNaN(weight_kg)) {
      setErrorMessage('体重を入力してください');
      return;
    }
    const body_fat = bodyFatInput !== '' ? parseFloat(bodyFatInput) : null;
    if (bodyFatInput !== '' && isNaN(body_fat!)) {
      setErrorMessage('体脂肪率に正しい数値を入力してください');
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await upsertBodyRecordAction({ date, weight_kg, body_fat });
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
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-medium text-white/85">
            {record ? '記録を編集' : '体重を記録'}
          </h2>
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

        {/* 日付（読み取り専用） */}
        <p className="text-[11px] text-white/25 mb-4">{date}</p>

        {/* 体重 */}
        <div className="mb-3">
          <label className="block text-[11px] text-white/45 mb-1.5">
            体重 <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" step="0.1" min="20" max="300"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="75.0"
              className={inputCls}
            />
            <span className="text-[12px] text-white/35 w-6">kg</span>
          </div>
        </div>

        {/* 体脂肪率 */}
        <div className="mb-5">
          <label className="block text-[11px] text-white/45 mb-1.5">
            体脂肪率
            <span className="ml-1 text-white/20">（任意）</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" step="0.1" min="3" max="60"
              value={bodyFatInput}
              onChange={(e) => setBodyFatInput(e.target.value)}
              placeholder="18.0"
              className={inputCls}
            />
            <span className="text-[12px] text-white/35 w-6">%</span>
          </div>
        </div>

        {/* エラーメッセージ */}
        {errorMessage && (
          <p className="text-red-400 text-[11px] mb-3">{errorMessage}</p>
        )}

        {/* 保存ボタン */}
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
