import type { BodyRecord, Goal } from '@/types';
import { getDateParts } from '@/utils/date';
import BodyRecordChart from '@/components/BodyRecordChart';
import RecordTable from '@/components/RecordTable';
import ProgressBar from '@/components/ProgressBar';

type Props = {
  records: BodyRecord[];
  latestRecord: BodyRecord | null;
  goal: Goal | null;
  onEdit: (record: BodyRecord) => void;
  onOpenGoalModal: () => void;
};

const sectionLabel = 'text-[11px] font-semibold uppercase tracking-[0.06em] mb-2' as const;
const cardStyle = {
  background: 'var(--bg-1)',
  border: '1px solid var(--line)',
  borderRadius: '18px',
} as const;

export default function RightPane({ records, latestRecord, goal, onEdit, onOpenGoalModal }: Props) {
  const latestId = records[0]?.id ?? null;
  const { weekday, monthDay, year } = getDateParts(new Date());
  const weight = latestRecord?.weight_kg ?? null;
  const bodyFat = latestRecord?.body_fat ?? null;

  return (
    <div className="flex flex-col gap-4 p-4 pb-28 md:p-5 md:pb-5">

      {/* SP のみ: 統計行ヘッダー（目標設定ボタン） */}
      <div className="md:hidden flex items-center justify-between mb-[-4px]">
        <span className="text-[11px]" style={{ color: 'var(--fg-4)' }}>今日の記録</span>
        <button
          onClick={onOpenGoalModal}
          className="flex items-center gap-1.5 text-[12px] transition-colors"
          style={{ color: 'var(--fg-3)' }}
          aria-label="目標を設定"
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          目標を設定
        </button>
      </div>

      {/* SP のみ: 3カラム統計行 */}
      <div className="md:hidden grid grid-cols-3 gap-2.5">
        {/* 日付カード */}
        <div
          className="flex flex-col justify-center rounded-[18px] px-3 py-3"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}
        >
          <div className="text-[11px] mb-0.5" style={{ color: 'var(--fg-3)' }}>{weekday.slice(0, 3)}</div>
          <div className="num text-[19px] font-bold leading-[1.2]" style={{ color: 'var(--fg)' }}>{monthDay}</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--fg-4)' }}>{year}</div>
        </div>
        {/* 体重 */}
        <div
          className="rounded-[18px] px-3 py-3"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}
        >
          <div className="text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>体重</div>
          <div className="num text-[22px] font-bold leading-none" style={{ color: 'var(--red)' }}>
            {weight !== null ? weight.toFixed(1) : '---'}
            <span className="text-[11px] ml-0.5" style={{ color: 'var(--fg-3)' }}>kg</span>
          </div>
        </div>
        {/* 体脂肪率 */}
        <div
          className="rounded-[18px] px-3 py-3"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}
        >
          <div className="text-[11px] mb-1.5" style={{ color: 'var(--fg-3)' }}>体脂肪率</div>
          <div className="num text-[22px] font-bold leading-none" style={{ color: 'var(--purple)' }}>
            {bodyFat !== null ? bodyFat.toFixed(1) : '---'}
            <span className="text-[11px] ml-0.5" style={{ color: 'var(--fg-3)' }}>%</span>
          </div>
        </div>
      </div>

      {/* SP のみ: プログレスバー */}
      <div className="md:hidden">
        <ProgressBar label="体重" current={weight} target={goal?.target_weight_kg ?? null} unit="kg" maxDiff={20} tone="red" />
        <ProgressBar label="体脂肪率" current={bodyFat} target={goal?.target_body_fat ?? null} unit="%" maxDiff={10} tone="purple" />
      </div>

      {/* グラフ */}
      <div>
        <div className={sectionLabel} style={{ color: 'var(--fg-2)' }}>直近1ヶ月</div>
        <div style={{ ...cardStyle, padding: '14px' }}>
          <BodyRecordChart records={records} />
        </div>
      </div>

      {/* 記録一覧 */}
      <div>
        <div className={sectionLabel} style={{ color: 'var(--fg-2)' }}>記録一覧</div>
        <div style={{ ...cardStyle, padding: '10px 14px' }}>
          <RecordTable records={records} latestId={latestId} onEdit={onEdit} />
        </div>
      </div>
    </div>
  );
}
