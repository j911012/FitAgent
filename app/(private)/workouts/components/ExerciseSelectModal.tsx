'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExercisesClient } from '../apis/exercises.client';
import { createExerciseAction, updateExerciseAction, deleteExerciseAction } from '../actions/exercises';
import type { BodyPart, Exercise } from '../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
};

type FormState = {
  mode: 'add' | 'edit';
  id?: string;
  name: string;
  body_part: BodyPart;
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

const chips = [
  { value: '' as BodyPart | '', label: 'すべて' },
  ...BODY_PARTS.map((bp) => ({ value: bp as BodyPart | '', label: BODY_PART_LABELS[bp] })),
];

const inputCls =
  'h-9 px-3 rounded-[8px] text-[13px] bg-transparent border outline-none focus:ring-1 focus:ring-[var(--red)]';
const inputStyle = { borderColor: 'var(--line)', color: 'var(--fg)' } as const;

const modalStyle = {
  background: 'var(--bg-2)',
  border: '1px solid var(--line-2)',
  boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
} as const;

export default function ExerciseSelectModal({ isOpen, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [bodyPart, setBodyPart] = useState<BodyPart | ''>('');
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercisesClient,
    // モーダルが開いている間のみフェッチする
    enabled: isOpen,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  }

  const createMutation = useMutation({
    mutationFn: (input: { name: string; body_part: BodyPart }) => createExerciseAction(input),
    onSuccess: (result) => {
      if (!result.isSuccess) { setFormError(result.errorMessage); return; }
      invalidate();
      setForm(null);
      setFormError(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name: string; body_part: BodyPart } }) =>
      updateExerciseAction(id, input),
    onSuccess: (result) => {
      if (!result.isSuccess) { setFormError(result.errorMessage); return; }
      invalidate();
      setForm(null);
      setFormError(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExerciseAction,
    onSuccess: (result) => {
      if (!result.isSuccess) { setDeleteError(result.errorMessage); return; }
      setDeleteError(null);
      invalidate();
    },
  });

  if (!isOpen) return null;

  const filtered = exercises
    .filter((e) => !query || e.name.toLowerCase().includes(query.toLowerCase()))
    .filter((e) => !bodyPart || e.body_part === bodyPart);

  function handleFormSubmit() {
    if (!form) return;
    setFormError(null);
    const input = { name: form.name.trim(), body_part: form.body_part };
    if (form.mode === 'add') {
      createMutation.mutate(input);
    } else if (form.id) {
      updateMutation.mutate({ id: form.id, input });
    }
  }

  function openEditForm(exercise: Exercise) {
    setForm({ mode: 'edit', id: exercise.id, name: exercise.name, body_part: exercise.body_part });
    setFormError(null);
    setDeleteError(null);
  }

  function openAddForm() {
    setForm({ mode: 'add', name: '', body_part: 'chest' });
    setFormError(null);
    setDeleteError(null);
  }

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const content = (
    <div className="flex flex-col" style={{ maxHeight: '80vh' }}>
      {/* ヘッダー: 検索 + 閉じる */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="種目を検索..."
          autoFocus
          className={`flex-1 ${inputCls}`}
          style={inputStyle}
        />
        <button
          onClick={onClose}
          className="transition-colors"
          style={{ color: 'var(--fg-3)' }}
          aria-label="閉じる"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 部位フィルタ */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto">
        {chips.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setBodyPart(value)}
            className="shrink-0 px-3 py-1 rounded-full text-[12px] transition-colors"
            style={
              bodyPart === value
                ? { background: 'var(--red)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.06)', color: 'var(--fg-3)' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* 種目一覧 */}
      <div className="flex-1 overflow-y-auto px-4">
        {deleteError && (
          <p className="text-[12px] mb-2" style={{ color: 'var(--red)' }}>{deleteError}</p>
        )}
        {isLoading ? (
          <p className="text-[13px] text-center py-8" style={{ color: 'var(--fg-4)' }}>読み込み中...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[13px] text-center py-8" style={{ color: 'var(--fg-4)' }}>種目が見つかりません</p>
        ) : (
          filtered.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => { onSelect(exercise); onClose(); }}
              className="flex items-center justify-between py-3 border-b cursor-pointer last:border-b-0"
              style={{ borderColor: 'var(--line)' }}
            >
              <div>
                <span className="text-[13px]" style={{ color: 'var(--fg)' }}>{exercise.name}</span>
                <span className="ml-2 text-[11px]" style={{ color: 'var(--fg-4)' }}>
                  {BODY_PART_LABELS[exercise.body_part]}
                </span>
              </div>
              {!exercise.is_default && (
                <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditForm(exercise)}
                    className="text-[12px] transition-colors hover:text-white"
                    style={{ color: 'var(--fg-4)' }}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => { setDeleteError(null); deleteMutation.mutate(exercise.id); }}
                    disabled={deleteMutation.isPending}
                    className="text-[12px] transition-colors hover:text-(--red) disabled:opacity-40"
                    style={{ color: 'var(--fg-4)' }}
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* フッター: 追加フォーム or 追加ボタン */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--line)' }}>
        {form ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="種目名"
              className={`w-full ${inputCls}`}
              style={inputStyle}
            />
            <select
              value={form.body_part}
              onChange={(e) => setForm({ ...form, body_part: e.target.value as BodyPart })}
              className={`w-full ${inputCls} appearance-none cursor-pointer`}
              style={inputStyle}
            >
              {BODY_PARTS.map((bp) => (
                <option key={bp} value={bp}>{BODY_PART_LABELS[bp]}</option>
              ))}
            </select>
            {formError && (
              <p className="text-[12px]" style={{ color: 'var(--red)' }}>{formError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleFormSubmit}
                disabled={isMutating}
                className="flex-1 h-9 rounded-[8px] text-[13px] font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--red)' }}
              >
                {isMutating ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => { setForm(null); setFormError(null); }}
                className="px-4 h-9 rounded-[8px] text-[13px]"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--fg-3)' }}
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openAddForm}
            className="w-full h-9 rounded-[8px] text-[13px] transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--fg-3)' }}
          >
            + カスタム種目を追加
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* PC: 中央モーダル */}
      <div
        className="hidden md:flex items-center justify-center h-full"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="w-full max-w-md mx-4 rounded-[22px] overflow-hidden" style={modalStyle}>
          {content}
        </div>
      </div>

      {/* SP: ボトムシート */}
      <div
        className="md:hidden fixed left-0 right-0 bottom-0 rounded-t-[22px] overflow-hidden"
        style={modalStyle}
      >
        {content}
      </div>
    </div>
  );
}
