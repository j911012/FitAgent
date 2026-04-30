import sql, { executeWithUserId } from "@/lib/db";
import type { Result } from "@/types";
import type { Exercise } from "../types";
import type { ExerciseInput } from "../schemas/exercise";

// PostgreSQLの行データをExercise型に変換する
function mapRow(row: Record<string, unknown>): Exercise {
  return {
    id: row.id as string,
    user_id: row.user_id as string | null,
    name: row.name as string,
    body_part: row.body_part as Exercise["body_part"],
    is_default: row.is_default as boolean,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

// グローバルマスタ（user_id IS NULL）＋ログインユーザーのカスタム種目を取得する
// RLSのexercises_select_policyにより、DBレベルでも自分のデータのみ返される
export async function fetchExercises(
  userId: string,
): Promise<Result<Exercise[]>> {
  try {
    const rows = await executeWithUserId(
      userId,
      sql`
        SELECT id, user_id, name, body_part, is_default, created_at, updated_at
        FROM exercises
        ORDER BY is_default DESC, name ASC
      `,
    );
    return { isSuccess: true, data: rows.map(mapRow) };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage:
        error instanceof Error ? error.message : "種目の取得に失敗しました",
    };
  }
}

// ユーザー固有のカスタム種目を作成する
export async function createExercise(
  input: ExerciseInput,
  userId: string,
): Promise<Result<Exercise>> {
  try {
    const rows = await executeWithUserId(
      userId,
      sql`
        INSERT INTO exercises (user_id, name, body_part, is_default)
        VALUES (${userId}, ${input.name}, ${input.body_part}, false)
        RETURNING id, user_id, name, body_part, is_default, created_at, updated_at
      `,
    );
    return { isSuccess: true, data: mapRow(rows[0]) };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage:
        error instanceof Error ? error.message : "種目の作成に失敗しました",
    };
  }
}

// ユーザー固有のカスタム種目を更新する
// user_idを条件に含めることで他ユーザーの種目を誤更新しない
export async function updateExercise(
  id: string,
  input: ExerciseInput,
  userId: string,
): Promise<Result<Exercise>> {
  try {
    const rows = await executeWithUserId(
      userId,
      sql`
        UPDATE exercises
        SET name = ${input.name}, body_part = ${input.body_part}, updated_at = now()
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id, user_id, name, body_part, is_default, created_at, updated_at
      `,
    );
    if (rows.length === 0) {
      return { isSuccess: false, errorMessage: "種目が見つかりません" };
    }
    return { isSuccess: true, data: mapRow(rows[0]) };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage:
        error instanceof Error ? error.message : "種目の更新に失敗しました",
    };
  }
}

// ユーザー固有のカスタム種目を削除する
// workout_setsで参照中の場合はON DELETE RESTRICTでDBエラーになるため、アプリ層でメッセージを返す
export async function deleteExercise(
  id: string,
  userId: string,
): Promise<Result<void>> {
  try {
    await executeWithUserId(
      userId,
      sql`DELETE FROM exercises WHERE id = ${id} AND user_id = ${userId}`,
    );
    return { isSuccess: true, data: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "種目の削除に失敗しました";
    // 外部キー制約違反（ON DELETE RESTRICT）の場合は専用メッセージを返す
    const isRestrict = message.includes("violates foreign key constraint");
    return {
      isSuccess: false,
      errorMessage: isRestrict
        ? "この種目はトレーニング記録で使用中のため削除できません"
        : message,
    };
  }
}
