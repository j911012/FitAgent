'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Result } from '@/types';
import type { BodyPart, Exercise } from '../types';

type Props = {
  // Server Componentからストリーミングで渡されるPromise。use()で解凍しSuspenseをトリガーする
  exercisesPromise: Promise<Result<Exercise[]>>;
};

const BODY_PART_LABELS: Record<BodyPart, string> = {
  chest: '胸',
  back: '背中',
  shoulder: '肩',
  arm: '腕',
  leg: '脚',
  abs: '腹',
};

const BODY_PARTS = Object.keys(BODY_PART_LABELS) as BodyPart[];

const selectBase =
  'h-9 px-2.5 rounded-[8px] text-[12px] bg-transparent border outline-none cursor-pointer appearance-none';

export default function FilterBar({ exercisesPromise }: Props) {
  const result = use(exercisesPromise);
  const exercises = result.isSuccess ? result.data : [];

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentBodyPart = (searchParams.get('bodyPart') as BodyPart) ?? '';
  const currentExercise = searchParams.get('exercise') ?? '';
  const currentRange = searchParams.get('range') ?? 'all';

  // 部位が選択されている場合はその部位の種目のみ表示する
  const filteredExercises = currentBodyPart
    ? exercises.filter((e) => e.body_part === currentBodyPart)
    : exercises;

  function handleBodyPartChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    // 部位が変わると対象種目も変わるため種目フィルタをリセットする
    params.delete('exercise');
    if (value) {
      params.set('bodyPart', value);
    } else {
      params.delete('bodyPart');
    }
    router.push(`/workouts?${params.toString()}`);
  }

  function handleExerciseChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value) {
      params.set('exercise', value);
    } else {
      params.delete('exercise');
    }
    router.push(`/workouts?${params.toString()}`);
  }

  function handleRangeChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (value && value !== 'all') {
      params.set('range', value);
    } else {
      params.delete('range');
    }
    router.push(`/workouts?${params.toString()}`);
  }

  const selectStyle = { color: 'var(--fg-2)', borderColor: 'var(--line)' };

  return (
    <div className="flex flex-wrap gap-2">
      {/* 部位フィルタ */}
      <select
        value={currentBodyPart}
        onChange={(e) => handleBodyPartChange(e.target.value)}
        className={`${selectBase} w-24 shrink-0`}
        style={selectStyle}
      >
        <option value="">すべての部位</option>
        {BODY_PARTS.map((bp) => (
          <option key={bp} value={bp}>
            {BODY_PART_LABELS[bp]}
          </option>
        ))}
      </select>

      {/* 種目フィルタ（部位が選択されている場合はその部位の種目のみ表示） */}
      <select
        value={currentExercise}
        onChange={(e) => handleExerciseChange(e.target.value)}
        className={`${selectBase} flex-1 min-w-[120px]`}
        style={selectStyle}
      >
        <option value="">すべての種目</option>
        {filteredExercises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>

      {/* 期間フィルタ */}
      <select
        value={currentRange}
        onChange={(e) => handleRangeChange(e.target.value)}
        className={`${selectBase} w-28 shrink-0`}
        style={selectStyle}
      >
        <option value="all">全期間</option>
        <option value="7days">過去7日</option>
        <option value="30days">過去30日</option>
        <option value="90days">過去90日</option>
      </select>
    </div>
  );
}
