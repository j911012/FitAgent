'use client';

import { use, useState } from 'react';
import type { BodyRecord, Goal, Result } from '@/types';
import { formatDateJa } from '@/utils/date';
import LeftPane from '@/components/LeftPane';
import RightPane from '@/components/RightPane';
import RecordModal from '@/components/RecordModal';
import GoalModal from '@/components/GoalModal';

type Props = {
  bodyRecordsPromise: Promise<Result<BodyRecord[]>>;
  goalPromise: Promise<Result<Goal | null>>;
};

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size, height: size,
        background: '#1a1040',
        borderRadius: size <= 24 ? 6 : 8,
        border: '0.5px solid rgba(124,58,237,0.4)',
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <rect x="1.5" y="9" width="3" height="6" rx="1" fill="#A78BFA" />
        <rect x="4.5" y="7" width="2.5" height="10" rx="1" fill="#A78BFA" />
        <rect x="7" y="10.5" width="10" height="3" rx="1.5" fill="#7C6AC4" />
        <rect x="17" y="7" width="2.5" height="10" rx="1" fill="#A78BFA" />
        <rect x="19.5" y="9" width="3" height="6" rx="1" fill="#A78BFA" />
      </svg>
    </div>
  );
}

function GearIcon() {
  return (
    <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

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
  const dateStr = formatDateJa(new Date());

  function openEditModal(record: BodyRecord) {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  }
  function closeRecordModal() {
    setIsRecordModalOpen(false);
    setEditingRecord(null);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダーバー */}
      <header
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="text-[14px] font-medium text-white/75">FitLog</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-white/22 hidden sm:block">{dateStr}</span>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="text-white/22 hover:text-violet-400 transition-colors p-0.5"
            aria-label="目標を設定"
          >
            <GearIcon />
          </button>
        </div>
      </header>

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
          />
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 md:overflow-y-auto">
          <RightPane
            records={records}
            latestRecord={latestRecord}
            goal={goal}
            onEdit={openEditModal}
          />
        </main>
      </div>

      {/* SP FAB — pill型、左下 */}
      <button
        onClick={() => setIsRecordModalOpen(true)}
        className="md:hidden fixed bottom-[22px] left-4 z-40 flex items-center gap-[7px] rounded-[50px] px-5 py-3 text-[14px] font-medium text-white"
        style={{
          background: 'rgba(124,58,237,0.85)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
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
