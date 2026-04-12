type Props = {
  label: string;
  current: number | null;
  target: number | null;
  unit: string;
  maxDiff: number;
};

export default function ProgressBar({ label, current, target, unit, maxDiff }: Props) {
  if (current === null || target === null) {
    return (
      <div className="mb-3.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-white/28">{label}</span>
          <span className="text-[11px] text-white/20">
            {current === null ? '未記録' : '目標未設定'}
          </span>
        </div>
        <div className="h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>
    );
  }

  const diff = current - target;
  const isAchieved = diff <= 0;
  const fillPct = isAchieved
    ? 100
    : Math.max(0, (1 - Math.min(diff, maxDiff) / maxDiff) * 100);

  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-white/28">{label}</span>
        {isAchieved ? (
          <span className="text-[11px] text-[#34D399] font-medium">達成！</span>
        ) : (
          <span className="text-[11px] text-violet-400 font-medium">
            残り {diff.toFixed(1)}{unit}
          </span>
        )}
      </div>
      <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${fillPct}%`,
            background: isAchieved ? '#34D399' : 'rgba(124,58,237,0.7)',
          }}
        />
      </div>
    </div>
  );
}
