'use server';

import { upsertBodyRecord, deleteBodyRecord } from '@/apis/bodyRecords.server';
import { bodyRecordSchema } from '@/schemas/bodyRecord';
import type { Result } from '@/types';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

type UpsertInput = {
  date: string;
  weight_kg: number;
  body_fat: number | null;
};

// セッションからuser_idを取得する共通処理
// 未認証の場合はnullを返す（Middlewareが通常はガードするが念のため確認する）
async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// 体重記録の登録・更新 Server Action
// バリデーション後にAPIクライアントへ委譲し、成功時にルートを再検証する
export async function upsertBodyRecordAction(input: UpsertInput): Promise<Result<void>> {
  const userId = await getUserId();
  if (!userId) {
    return { isSuccess: false, errorMessage: 'ログインが必要です' };
  }

  const parsed = bodyRecordSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました';
    return { isSuccess: false, errorMessage: msg };
  }

  const result = await upsertBodyRecord(parsed.data, userId);
  if (result.isSuccess) {
    revalidatePath('/');
  }
  return result;
}

// 体重記録の削除 Server Action
export async function deleteBodyRecordAction(id: string): Promise<Result<void>> {
  const userId = await getUserId();
  if (!userId) {
    return { isSuccess: false, errorMessage: 'ログインが必要です' };
  }

  const result = await deleteBodyRecord(id, userId);
  if (result.isSuccess) {
    revalidatePath('/');
  }
  return result;
}
