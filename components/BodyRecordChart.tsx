import type { BodyRecord } from '@/types';
import { getRecentDates, formatShortDate, toDateString } from '@/utils/date';

type Props = {
  records: BodyRecord[];
};

// --- SVG レイアウト定数（preserveAspectRatio="none"で横幅いっぱいに引き伸ばす）---
const VW = 434;   // viewBox width（引き伸ばし前提のため実際の表示幅とは無関係）
const VH = 110;   // viewBox height（高さを増やしてグラフを見やすく）
const MT = 3;     // 上マージン（今日バーのハイライト strip 分）
const DAYS = 30;
const SLOT = VW / DAYS;          // 1日分の幅 ≈ 14.47
const BAR_W = 12;                // バー幅
const BAR_OFF = (SLOT - BAR_W) / 2;  // バー左オフセット（中央揃え）

// i番目のバーの左端X座標
function bx(i: number) {
  return i * SLOT + BAR_OFF;
}
// i番目のスロット中央のX座標（体脂肪率ドット用）
function cx(i: number) {
  return i * SLOT + SLOT / 2;
}
// 値をY座標に変換（min=下端VH, max=上端MT）
function toY(val: number, min: number, max: number) {
  if (max === min) return MT + (VH - MT) / 2;
  return MT + (VH - MT) * (1 - (val - min) / (max - min));
}

// X軸ラベルに使うインデックス（5日刻み + 最終日）
const LABEL_INDICES = [0, 5, 10, 15, 20, 25, DAYS - 1];

export default function BodyRecordChart({ records }: Props) {
  const today = toDateString(new Date());
  const dates = getRecentDates(DAYS); // 古い順（dates[DAYS-1] = today）

  const recordMap = new Map(records.map((r) => [r.date, r]));

  // 体重スケール（最小値より少し下、最大値より少し上に余白）
  const weights = records.map((r) => r.weight_kg);
  const hasWeight = weights.length > 0;
  const rawMinW = hasWeight ? Math.min(...weights) : 60;
  const rawMaxW = hasWeight ? Math.max(...weights) : 80;
  const padW = Math.max((rawMaxW - rawMinW) * 0.15, 1);
  const minW = rawMinW - padW;
  const maxW = rawMaxW + padW;

  // 体脂肪率スケール
  const bfs = records.flatMap((r) => (r.body_fat !== null ? [r.body_fat] : []));
  const hasBF = bfs.length > 0;
  const rawMinBF = hasBF ? Math.min(...bfs) : 10;
  const rawMaxBF = hasBF ? Math.max(...bfs) : 30;
  const padBF = Math.max((rawMaxBF - rawMinBF) * 0.15, 0.5);
  const minBF = rawMinBF - padBF;
  const maxBF = rawMaxBF + padBF;

  // 体脂肪率折れ線パス（データがある日だけを M/L で繋ぐ）
  let bfPath = '';
  dates.forEach((date, i) => {
    const r = recordMap.get(date);
    if (r?.body_fat == null) return;
    const x = cx(i);
    const y = toY(r.body_fat, minBF, maxBF);
    bfPath += bfPath === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  // X軸ラベル用の日付（LABEL_INDICESに対応）
  const labelDates = LABEL_INDICES.map((i) => dates[i]);

  return (
    <div>
      {/* チャート凡例 */}
      <div className="flex gap-3 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-[7px] rounded-[1px]" style={{ background: 'oklch(0.68 0.22 18 / 0.6)' }} />
          <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>体重</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative w-4 h-0" style={{ borderTop: '2px solid var(--green)' }}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full" style={{ background: 'var(--green)' }} />
          </div>
          <span className="text-[10px]" style={{ color: 'var(--fg-3)' }}>体脂肪率</span>
        </div>
      </div>

      {/* バー + 折れ線 SVG（横幅いっぱいに引き伸ばす）*/}
      <svg
        width="100%"
        height={VH}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        aria-label="直近30日の体重・体脂肪率グラフ"
      >
        {/* 体重 棒グラフ */}
        {dates.map((date, i) => {
          const r = recordMap.get(date);
          if (!r) return null;
          const y = toY(r.weight_kg, minW, maxW);
          const barH = VH - y;
          const isToday = date === today;
          return (
            <g key={date}>
              <rect
                x={bx(i)} y={y}
                width={BAR_W} height={barH}
                rx={1.5}
                fill={isToday ? 'oklch(0.68 0.22 18 / 0.85)' : 'oklch(0.68 0.22 18 / 0.35)'}
              />
              {/* 今日のバーのみ上端にハイライト stripe を表示 */}
              {isToday && (
                <rect
                  x={bx(i)} y={y}
                  width={BAR_W} height={2}
                  rx={1}
                  fill="var(--red)"
                />
              )}
            </g>
          );
        })}

        {/* 体脂肪率 折れ線（var(--green)） */}
        {hasBF && bfPath && (
          <path
            d={bfPath}
            fill="none"
            stroke="oklch(0.78 0.18 155)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* 体脂肪率 データ点 */}
        {hasBF && dates.map((date, i) => {
          const r = recordMap.get(date);
          if (r?.body_fat == null) return null;
          const isToday = date === today;
          return (
            <circle
              key={date}
              cx={cx(i)}
              cy={toY(r.body_fat, minBF, maxBF)}
              r={isToday ? 3 : 2}
              fill="oklch(0.78 0.18 155)"
              stroke={isToday ? '#0A0A0B' : 'none'}
              strokeWidth={isToday ? 1.5 : 0}
            />
          );
        })}
      </svg>

      {/* X軸ラベル（SVG外に配置してpreserveAspectRatio="none"による文字歪みを回避）*/}
      <div className="flex justify-between mt-1">
        {labelDates.map((date, idx) => {
          const isToday = date === today;
          const isLast = idx === labelDates.length - 1;
          return (
            <span
              key={date}
              className="text-[9px]"
              style={{ color: isToday ? 'var(--red)' : 'var(--fg-4)', fontWeight: isToday ? 500 : 400 }}
            >
              {formatShortDate(date)}{isLast ? '（今日）' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}
