import sql, { executeWithUserId } from '@/lib/db';
import type { Goal, Result } from '@/types';
import type { GoalInput } from '@/schemas/goal';

// ログインユーザーの最新の目標を取得する
// executeWithUserIdでNeon RLSのapp.current_user_idも設定し二重の安全網とする
export async function fetchLatestGoal(userId: string): Promise<Result<Goal | null>> {
  try {
    const rows = await executeWithUserId(
      userId,
      sql`
        SELECT id, user_id, target_weight_kg, target_body_fat, created_at, updated_at
        FROM goals
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 1
      `
    );
    if (rows.length === 0) return { isSuccess: true, data: null };

    const row = rows[0];
    return {
      isSuccess: true,
      data: {
        id: row.id as string,
        user_id: row.user_id as string,
        target_weight_kg: row.target_weight_kg != null ? Number(row.target_weight_kg) : null,
        target_body_fat: row.target_body_fat != null ? Number(row.target_body_fat) : null,
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      },
    };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : '目標の取得に失敗しました',
    };
  }
}

// ログインユーザーの目標を保存する
// v1.1: UNIQUE(user_id)制約が追加されたため、ON CONFLICT DO UPDATEで既存レコードを上書きする
// v1.0の「履歴として積み上げる」設計から「ユーザー1件」設計に変更
export async function upsertGoal(input: GoalInput, userId: string): Promise<Result<void>> {
  try {
    await executeWithUserId(
      userId,
      sql`
        INSERT INTO goals (user_id, target_weight_kg, target_body_fat)
        VALUES (${userId}, ${input.target_weight_kg}, ${input.target_body_fat})
        ON CONFLICT (user_id) DO UPDATE
          SET target_weight_kg = EXCLUDED.target_weight_kg,
              target_body_fat  = EXCLUDED.target_body_fat,
              updated_at       = now()
      `
    );
    return { isSuccess: true, data: undefined };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : '目標の保存に失敗しました',
    };
  }
}
