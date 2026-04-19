import type { BodyRecord, Goal } from "@/types";
import { getDateParts } from "@/utils/date";
import ProgressBar from "@/components/ProgressBar";

type Props = {
  latestRecord: BodyRecord | null;
  goal: Goal | null;
  onOpenRecordModal: () => void;
  // 目標設定モーダルのトリガー（ヘッダーを (private) layout に移したため左ペインに配置）
  onOpenGoalModal: () => void;
};

export default function LeftPane({
  latestRecord,
  goal,
  onOpenRecordModal,
  onOpenGoalModal,
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

      {/* ボタン群 */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* 記録ボタン */}
        <button
          onClick={onOpenRecordModal}
          className="flex items-center justify-center gap-2 rounded-[10px] py-3 text-[14px] font-medium text-white/92 w-full"
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

        {/* 目標設定ボタン */}
        <button
          onClick={onOpenGoalModal}
          className="flex items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13px] font-medium text-white/38 hover:text-white/60 transition-colors w-full"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "0.5px solid rgba(255,255,255,0.07)",
          }}
          aria-label="目標を設定"
        >
          <svg
            className="w-[14px] h-[14px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          目標を設定
        </button>
      </div>
    </div>
  );
}
