type Props = {
  label: string;
  current: number | null;
  target: number | null;
  unit: string;
  maxDiff: number;
  tone?: 'red' | 'purple';
};

export default function ProgressBar({ label, current, target, unit, maxDiff, tone = 'red' }: Props) {
  const barColor = tone === 'red' ? 'var(--red)' : 'var(--purple)';

  if (current === null || target === null) {
    return (
      <div className="mb-3.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px]" style={{ color: 'var(--fg-3)' }}>{label}</span>
          <span className="text-[11px]" style={{ color: 'var(--fg-4)' }}>
            {current === null ? '未記録' : '目標未設定'}
          </span>
        </div>
        <div className="h-[4px] rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
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
        <span className="text-[11px]" style={{ color: 'var(--fg-3)' }}>{label}</span>
        {isAchieved ? (
          <span className="text-[11px] font-medium" style={{ color: 'var(--green)' }}>達成！</span>
        ) : (
          <span className="text-[11px] font-medium" style={{ color: barColor }}>
            残り {diff.toFixed(1)}{unit}
          </span>
        )}
      </div>
      <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${fillPct}%`,
            background: isAchieved ? 'var(--green)' : barColor,
          }}
        />
      </div>
    </div>
  );
}
