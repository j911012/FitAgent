'use client';

import { useTransition } from 'react';
import type { BodyRecord } from '@/types';
import { deleteBodyRecordAction } from '@/actions/bodyRecords';
import { toDateString, formatShortDate } from '@/utils/date';

type Props = {
  records: BodyRecord[];
  latestId: string | null;
  onEdit: (record: BodyRecord) => void;
};

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const DeleteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

// PC / SP で列幅を切り替える（日付 | 体重 | 体脂肪率 | 操作）
const PC_COLS = '1fr 80px 72px 56px';
const SP_COLS = '1fr 60px 52px 44px';

// レンダー内で定義するとレンダーごとに別の型として生成され state がリセットされるため外側で定義する
function HeaderRow({ cols }: { cols: string }) {
  return (
    <div
      className="grid pb-[6px] border-b border-white/[.06]"
      style={{ gridTemplateColumns: cols, gap: '8px' }}
    >
      <span className="text-[11px] text-white/20">日付</span>
      <span className="text-[11px] text-white/20 text-right">体重</span>
      <span className="text-[11px] text-white/20 text-right">体脂肪率</span>
      <span className="text-[11px] text-white/20 text-right">操作</span>
    </div>
  );
}

export default function RecordTable({ records, latestId, onEdit }: Props) {
  const [isPending, startTransition] = useTransition();
  const today = toDateString(new Date());

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteBodyRecordAction(id);
    });
  }

  if (records.length === 0) {
    return (
      <p className="text-center text-white/20 py-8 text-[12px]">
        まだ記録がありません
      </p>
    );
  }

  return (
    <div>
      <div className="hidden md:block"><HeaderRow cols={PC_COLS} /></div>
      <div className="block md:hidden"><HeaderRow cols={SP_COLS} /></div>

      {records.map((record) => {
        const isLatest = record.id === latestId;
        const isToday = record.date === today;
        const dateLabel = isToday
          ? `今日 ${formatShortDate(record.date)}`
          : formatShortDate(record.date);

        const rowCls = `grid items-center py-2.5 border-b border-white/[.04] last:border-b-0 ${
          isLatest ? 'bg-[rgba(124,58,237,0.05)] rounded-[6px] px-2 -mx-2' : ''
        }`;
        const dateCls = isToday ? 'text-violet-400 font-medium' : 'text-white/45';

        return (
          <div key={record.id}>
            {/* PC 行 */}
            <div className={`hidden md:grid ${rowCls}`} style={{ gridTemplateColumns: PC_COLS, gap: '8px' }}>
              <span className={`text-[13px] ${dateCls}`}>{dateLabel}</span>
              <span className="text-[13px] font-medium text-white/80 text-right">
                {record.weight_kg.toFixed(1)} kg
              </span>
              <span className="text-[12px] text-white/35 text-right">
                {record.body_fat !== null ? `${record.body_fat.toFixed(1)} %` : '—'}
              </span>
              <div className="flex items-center justify-end gap-2.5">
                <button onClick={() => onEdit(record)} className="text-white/[.18] hover:text-violet-400 transition-colors" aria-label="編集">
                  <EditIcon />
                </button>
                <button onClick={() => handleDelete(record.id)} disabled={isPending} className="text-white/[.12] hover:text-red-400 transition-colors disabled:opacity-40" aria-label="削除">
                  <DeleteIcon />
                </button>
              </div>
            </div>

            {/* SP 行 */}
            <div className={`grid md:hidden ${rowCls}`} style={{ gridTemplateColumns: SP_COLS, gap: '6px' }}>
              <span className={`text-[12px] ${dateCls}`}>
                {isToday ? '今日' : formatShortDate(record.date)}
              </span>
              <span className="text-[12px] font-medium text-white/80 text-right">
                {record.weight_kg.toFixed(1)}
              </span>
              <span className="text-[11px] text-white/35 text-right">
                {record.body_fat !== null ? `${record.body_fat.toFixed(1)}%` : '—'}
              </span>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => onEdit(record)} className="text-white/[.18] hover:text-violet-400 transition-colors" aria-label="編集">
                  <EditIcon />
                </button>
                <button onClick={() => handleDelete(record.id)} disabled={isPending} className="text-white/[.12] hover:text-red-400 transition-colors disabled:opacity-40" aria-label="削除">
                  <DeleteIcon />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
