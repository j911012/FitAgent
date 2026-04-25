'use client';

import { use, useState } from 'react';
import type { BodyRecord, Goal, Result } from '@/types';
import LeftPane from '@/components/LeftPane';
import RightPane from '@/components/RightPane';
import RecordModal from '@/components/RecordModal';
import GoalModal from '@/components/GoalModal';

type Props = {
  bodyRecordsPromise: Promise<Result<BodyRecord[]>>;
  goalPromise: Promise<Result<Goal | null>>;
};

export default function Dashboard({ bodyRecordsPromise, goalPromise }: Props) {
  const bodyRecordsResult = use(bodyRecordsPromise);
  const goalResult = use(goalPromise);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BodyRecord | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  if (!bodyRecordsResult.isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400 text-sm">{bodyRecordsResult.errorMessage}</p>
      </div>
    );
  }
  if (!goalResult.isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400 text-sm">{goalResult.errorMessage}</p>
      </div>
    );
  }

  const records = bodyRecordsResult.data;
  const goal = goalResult.data;
  const latestRecord = records[0] ?? null;

  function openEditModal(record: BodyRecord) {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  }
  function closeRecordModal() {
    setIsRecordModalOpen(false);
    setEditingRecord(null);
  }

  return (
    // layout の flex-1 コンテナを埋めるために h-full を使用する
    <div className="flex flex-col h-full">
      {/* ボディ */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* PC 左ペイン */}
        <aside
          className="hidden md:flex md:w-[280px] flex-shrink-0 flex-col"
          style={{ borderRight: '0.5px solid rgba(255,255,255,0.05)' }}
        >
          <LeftPane
            latestRecord={latestRecord}
            goal={goal}
            onOpenRecordModal={() => setIsRecordModalOpen(true)}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 md:overflow-y-auto">
          <RightPane
            records={records}
            latestRecord={latestRecord}
            goal={goal}
            onEdit={openEditModal}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
        </main>
      </div>

      {/* SP FAB — pill型、左下 */}
      <button
        onClick={() => setIsRecordModalOpen(true)}
        className="md:hidden fixed bottom-[22px] left-4 z-40 flex items-center gap-[7px] rounded-[50px] px-5 py-3 text-[14px] font-semibold text-white"
        style={{
          background: 'var(--red)',
          boxShadow: '0 4px 20px oklch(0.68 0.22 18 / 0.45)',
        }}
        aria-label="体重を記録"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        体重を記録
      </button>

      {/* key でモーダルを再マウントし、開くたびに state を自動リセットする */}
      <RecordModal
        key={isRecordModalOpen ? (editingRecord?.id ?? 'new') : 'closed'}
        isOpen={isRecordModalOpen}
        record={editingRecord}
        onClose={closeRecordModal}
      />
      {/* key でモーダルを再マウントし、開くたびに state を自動リセットする */}
      <GoalModal
        key={isGoalModalOpen ? 'goal-open' : 'goal-closed'}
        isOpen={isGoalModalOpen}
        goal={goal}
        onClose={() => setIsGoalModalOpen(false)}
      />
    </div>
  );
}
