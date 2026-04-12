import type { BodyRecord, Goal } from "@/types";
import { getDateParts } from "@/utils/date";
import ProgressBar from "@/components/ProgressBar";

type Props = {
  latestRecord: BodyRecord | null;
  goal: Goal | null;
  onOpenRecordModal: () => void;
};

export default function LeftPane({
  latestRecord,
  goal,
  onOpenRecordModal,
}: Props) {
  const { weekday, monthDay, year } = getDateParts(new Date());
  const weight = latestRecord?.weight_kg ?? null;
  const bodyFat = latestRecord?.body_fat ?? null;

  return (
    <div className="flex flex-col gap-3.5 p-5 h-full">
      {/* 日付カード */}
      <div
        className="rounded-[11px] px-4 py-3.5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-[12px] text-white/30 mb-1">{weekday}</div>
        <div className="text-[26px] font-medium text-white/85 leading-[1.2]">
          {monthDay}
        </div>
        <div className="text-[12px] text-white/25 mt-1.5">{year}</div>
      </div>

      {/* 体重・体脂肪率（2カラム） */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "体重", value: weight, unit: "kg" },
          { label: "体脂肪率", value: bodyFat, unit: "%" },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-[11px] px-4 py-3.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="text-[11px] text-white/28 mb-2">{label}</div>
            <div className="text-[32px] font-medium text-white/90 leading-none">
              {value !== null ? value.toFixed(1) : "---"}
              <span className="text-[13px] text-white/35 ml-0.5">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* プログレスバー */}
      <div className="pt-1">
        <ProgressBar
          label="体重"
          current={weight}
          target={goal?.target_weight_kg ?? null}
          unit="kg"
          maxDiff={20}
        />
        <ProgressBar
          label="体脂肪率"
          current={bodyFat}
          target={goal?.target_body_fat ?? null}
          unit="%"
          maxDiff={10}
        />
      </div>

      {/* 記録ボタン */}
      <button
        onClick={onOpenRecordModal}
        className="flex items-center justify-center gap-2 rounded-[10px] py-3 text-[14px] font-medium text-white/92 w-full mt-auto"
        style={{ background: "rgba(124,58,237,0.55)" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.5}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        体重を記録
      </button>
    </div>
  );
}
