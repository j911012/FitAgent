import sql from '@/lib/db';
import type { Goal, Result } from '@/types';
import type { GoalInput } from '@/schemas/goal';

// 最新の目標を1件取得する
// v1.0はシングルユーザー設計のため最新行を現在の目標として扱う
export async function fetchLatestGoal(): Promise<Result<Goal | null>> {
  try {
    const rows = await sql`
      SELECT id, target_weight_kg, target_body_fat, created_at, updated_at
      FROM goals
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (rows.length === 0) return { isSuccess: true, data: null };

    const row = rows[0];
    return {
      isSuccess: true,
      data: {
        id: row.id as string,
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

// 目標を保存する（新規INSERT。最新行を現在の目標として扱うため履歴として積み上げる）
export async function insertGoal(input: GoalInput): Promise<Result<void>> {
  try {
    await sql`
      INSERT INTO goals (target_weight_kg, target_body_fat)
      VALUES (${input.target_weight_kg}, ${input.target_body_fat})
    `;
    return { isSuccess: true, data: undefined };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : '目標の保存に失敗しました',
    };
  }
}
