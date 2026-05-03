'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { workoutSessionSchema } from '../schemas/workoutSession';
import { createWorkoutSession, updateWorkoutSession, deleteWorkoutSession } from '../apis/workouts.server';
import type { Result } from '@/types';

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function createWorkoutSessionAction(input: unknown): Promise<Result<{ id: string }>> {
  const userId = await getUserId();
  if (!userId) return { isSuccess: false, errorMessage: 'ログインが必要です' };

  const parsed = workoutSessionSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました';
    return { isSuccess: false, errorMessage: msg };
  }

  const result = await createWorkoutSession(parsed.data, userId);
  if (result.isSuccess) {
    revalidatePath('/workouts');
  }
  return result;
}

export async function updateWorkoutSessionAction(sessionId: string, input: unknown): Promise<Result<void>> {
  const userId = await getUserId();
  if (!userId) return { isSuccess: false, errorMessage: 'ログインが必要です' };

  const parsed = workoutSessionSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました';
    return { isSuccess: false, errorMessage: msg };
  }

  const result = await updateWorkoutSession(sessionId, parsed.data, userId);
  if (result.isSuccess) {
    revalidatePath('/workouts');
    revalidatePath(`/workouts/${sessionId}`);
  }
  return result;
}

export async function deleteWorkoutSessionAction(sessionId: string): Promise<Result<void>> {
  const userId = await getUserId();
  if (!userId) return { isSuccess: false, errorMessage: 'ログインが必要です' };

  const result = await deleteWorkoutSession(sessionId, userId);
  if (result.isSuccess) {
    revalidatePath('/workouts');
  }
  return result;
}
