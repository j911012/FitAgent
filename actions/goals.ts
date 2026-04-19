'use server';

import { upsertGoal } from '@/apis/goals.server';
import { goalSchema } from '@/schemas/goal';
import type { Result } from '@/types';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

type GoalInput = {
  target_weight_kg: number | null;
  target_body_fat: number | null;
};

// 目標設定 Server Action
// バリデーション後にAPIクライアントへ委譲し、成功時にルートを再検証する
export async function upsertGoalAction(input: GoalInput): Promise<Result<void>> {
  // Middlewareが通常はガードするが、念のためセッションを確認する
  const session = await auth();
  if (!session?.user?.id) {
    return { isSuccess: false, errorMessage: 'ログインが必要です' };
  }

  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'バリデーションエラーが発生しました';
    return { isSuccess: false, errorMessage: msg };
  }

  const result = await upsertGoal(parsed.data, session.user.id);
  if (result.isSuccess) {
    revalidatePath('/');
  }
  return result;
}
