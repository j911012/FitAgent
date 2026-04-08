'use server';

import { upsertBodyRecord, deleteBodyRecord } from '@/apis/bodyRecords.server';
import { bodyRecordSchema } from '@/schemas/bodyRecord';
import type { Result } from '@/types';
import { revalidatePath } from 'next/cache';

type UpsertInput = {
  date: string;
  weight_kg: number;
  body_fat: number | null;
};

// 体重記録の登録・更新 Server Action
// バリデーション後にAPIクライアントへ委譲し、成功時にルートを再検証する
export async function upsertBodyRecordAction(input: UpsertInput): Promise<Result<void>> {
  const parsed = bodyRecordSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました';
    return { isSuccess: false, errorMessage: msg };
  }

  const result = await upsertBodyRecord(parsed.data);
  if (result.isSuccess) {
    revalidatePath('/');
  }
  return result;
}

// 体重記録の削除 Server Action
export async function deleteBodyRecordAction(id: string): Promise<Result<void>> {
  const result = await deleteBodyRecord(id);
  if (result.isSuccess) {
    revalidatePath('/');
  }
  return result;
}
