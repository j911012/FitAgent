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
};

const sectionLabel = 'text-[11px] font-medium text-white/[.22] uppercase tracking-[0.08em] mb-2';
const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: '11px',
};

export default function RightPane({ records, latestRecord, goal, onEdit }: Props) {
  const latestId = records[0]?.id ?? null;
  const { weekday, monthDay, year } = getDateParts(new Date());
  const weight = latestRecord?.weight_kg ?? null;
  const bodyFat = latestRecord?.body_fat ?? null;

  return (
    <div className="flex flex-col gap-4 p-4 pb-28 md:p-5 md:pb-5">

      {/* SP のみ: 3カラム統計行 */}
      <div className="md:hidden grid grid-cols-3 gap-2.5">
        {/* 日付カード */}
        <div
          className="flex flex-col justify-center rounded-[11px] px-3 py-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-[11px] text-white/28 mb-0.5">{weekday.slice(0, 3)}</div>
          <div className="text-[19px] font-medium text-white/85 leading-[1.2]">{monthDay}</div>
          <div className="text-[11px] text-white/22 mt-1">{year}</div>
        </div>
        {/* 体重 */}
        <div
          className="rounded-[11px] px-3 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}
        >
          <div className="text-[11px] text-white/28 mb-1.5">体重</div>
          <div className="text-[24px] font-medium text-white/90 leading-none">
            {weight !== null ? weight.toFixed(1) : '---'}
            <span className="text-[11px] text-white/35 ml-0.5">kg</span>
          </div>
        </div>
        {/* 体脂肪率 */}
        <div
          className="rounded-[11px] px-3 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}
        >
          <div className="text-[11px] text-white/28 mb-1.5">体脂肪率</div>
          <div className="text-[24px] font-medium text-white/90 leading-none">
            {bodyFat !== null ? bodyFat.toFixed(1) : '---'}
            <span className="text-[11px] text-white/35 ml-0.5">%</span>
          </div>
        </div>
      </div>

      {/* SP のみ: プログレスバー */}
      <div className="md:hidden">
        <ProgressBar label="体重" current={weight} target={goal?.target_weight_kg ?? null} unit="kg" maxDiff={20} />
        <ProgressBar label="体脂肪率" current={bodyFat} target={goal?.target_body_fat ?? null} unit="%" maxDiff={10} />
      </div>

      {/* グラフ */}
      <div>
        <div className={sectionLabel}>直近1ヶ月</div>
        <div style={{ ...cardStyle, padding: '14px' }}>
          <BodyRecordChart records={records} />
        </div>
      </div>

      {/* 記録一覧 */}
      <div>
        <div className={sectionLabel}>記録一覧</div>
        <div style={{ ...cardStyle, padding: '10px 14px' }}>
          <RecordTable records={records} latestId={latestId} onEdit={onEdit} />
        </div>
      </div>
    </div>
  );
}
