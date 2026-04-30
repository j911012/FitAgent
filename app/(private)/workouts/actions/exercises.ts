'use server';

import { auth } from '@/auth';
import { exerciseSchema } from '../schemas/exercise';
import { createExercise, updateExercise, deleteExercise } from '../apis/exercises.server';
import type { Result } from '@/types';
import type { Exercise } from '../types';
// exercisesはTanStack Queryでクライアント管理するためData Cache再検証は不要
// キャッシュ更新はクライアントのinvalidateQueriesに委任する

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function createExerciseAction(input: unknown): Promise<Result<Exercise>> {
  const userId = await getUserId();
  if (!userId) return { isSuccess: false, errorMessage: 'ログインが必要です' };

  const parsed = exerciseSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました';
    return { isSuccess: false, errorMessage: msg };
  }

  return await createExercise(parsed.data, userId);
}

export async function updateExerciseAction(id: string, input: unknown): Promise<Result<Exercise>> {
  const userId = await getUserId();
  if (!userId) return { isSuccess: false, errorMessage: 'ログインが必要です' };

  const parsed = exerciseSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました';
    return { isSuccess: false, errorMessage: msg };
  }

  return await updateExercise(id, parsed.data, userId);
}

export async function deleteExerciseAction(id: string): Promise<Result<void>> {
  const userId = await getUserId();
  if (!userId) return { isSuccess: false, errorMessage: 'ログインが必要です' };

  return await deleteExercise(id, userId);
}
