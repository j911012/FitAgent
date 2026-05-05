import Link from 'next/link';
import type { WorkoutSessionSummary } from '../types';

type Props = { session: WorkoutSessionSummary };

// 'YYYY-MM-DD' を Date に変換する（new Date(str) はUTC扱いになるためローカル時刻で生成）
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'] as const;

function formatDateJa(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY_JA[d.getDay()]}）`;
}

export default function SessionCard({ session }: Props) {
  return (
    <Link
      href={`/workouts/${session.id}`}
      className="block rounded-[12px] px-4 py-3.5 transition-colors"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--line)',
      }}
    >
      <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--fg-2)' }}>
        {formatDateJa(session.date)}
      </p>

      <div className="flex items-center gap-4">
        <Stat label="種目" value={`${session.exerciseCount}`} unit="種目" />
        <Stat label="セット" value={`${session.totalSets}`} unit="セット" />
        <Stat label="総ボリューム" value={session.totalVolume.toLocaleString()} unit="kg" />
      </div>
    </Link>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-baseline gap-0.5">
      <span className="text-[15px] font-bold" style={{ color: 'var(--fg)' }}>
        {value}
      </span>
      <span className="text-[11px]" style={{ color: 'var(--fg-4)' }}>
        {unit}
      </span>
    </div>
  );
}
