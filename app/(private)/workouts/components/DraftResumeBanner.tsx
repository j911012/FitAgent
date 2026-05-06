'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toDateString } from '@/utils/date';

const DRAFT_KEY = 'workout-draft';

export default function DraftResumeBanner() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  // マウント後に今日の下書きが存在するか確認する
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { date: string; exercises: unknown[] };
      if (draft.date === toDateString(new Date()) && draft.exercises.length > 0) {
        setVisible(true);
      }
    } catch {}
  }, []);

  if (!visible) return null;

  function handleResume() {
    router.push('/workouts/new');
  }

  function handleDiscard() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setVisible(false);
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-[10px] text-[13px]"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)' }}
    >
      <span style={{ color: 'var(--fg-3)' }}>入力中のトレーニングがあります</span>
      <div className="flex gap-3">
        <button
          onClick={handleDiscard}
          className="text-[12px] transition-colors"
          style={{ color: 'var(--fg-4)' }}
        >
          破棄
        </button>
        <button
          onClick={handleResume}
          className="text-[12px] font-medium transition-colors"
          style={{ color: 'var(--red)' }}
        >
          再開
        </button>
      </div>
    </div>
  );
}
