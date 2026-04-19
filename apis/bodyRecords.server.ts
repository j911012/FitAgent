import sql, { executeWithUserId } from "@/lib/db";
import type { BodyRecord, Result } from "@/types";
import type { BodyRecordInput } from "@/schemas/bodyRecord";

// PostgreSQLのnumeric型はJSONシリアライズ時に文字列で返ってくるためNumber()でパースする
function mapRow(row: Record<string, unknown>): BodyRecord {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    // PostgreSQLのdate型はドライバーがDateオブジェクトとして返すため、YYYY-MM-DD文字列に変換する
    date: row.date instanceof Date
      ? `${row.date.getFullYear()}-${String(row.date.getMonth() + 1).padStart(2, '0')}-${String(row.date.getDate()).padStart(2, '0')}`
      : String(row.date),
    weight_kg: Number(row.weight_kg),
    body_fat: row.body_fat != null ? Number(row.body_fat) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

// ログインユーザーのレコードを新しい順で取得する
// executeWithUserIdでNeon RLSのapp.current_user_idも設定し二重の安全網とする
export async function fetchBodyRecords(userId: string): Promise<Result<BodyRecord[]>> {
  try {
    const rows = await executeWithUserId(
      userId,
      sql`
        SELECT id, user_id, date, weight_kg, body_fat, created_at, updated_at
        FROM body_records
        WHERE user_id = ${userId}
        ORDER BY date DESC
      `
    );
    return { isSuccess: true, data: rows.map((row) => mapRow(row)) };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage:
        error instanceof Error ? error.message : "データの取得に失敗しました",
    };
  }
}

// ログインユーザーの体重記録を登録または更新する（同日レコードはUPSERT）
// v1.1: UNIQUE制約が(user_id, date)に変更されたためON CONFLICTもそれに合わせる
export async function upsertBodyRecord(input: BodyRecordInput, userId: string): Promise<Result<void>> {
  try {
    await executeWithUserId(
      userId,
      sql`
        INSERT INTO body_records (user_id, date, weight_kg, body_fat)
        VALUES (${userId}, ${input.date}, ${input.weight_kg}, ${input.body_fat})
        ON CONFLICT (user_id, date) DO UPDATE
          SET weight_kg  = EXCLUDED.weight_kg,
              body_fat   = EXCLUDED.body_fat,
              updated_at = now()
      `
    );
    return { isSuccess: true, data: undefined };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : "保存に失敗しました",
    };
  }
}

// ログインユーザーの体重記録を削除する
// user_idを条件に加えることで他ユーザーのレコードを誤削除しない
export async function deleteBodyRecord(id: string, userId: string): Promise<Result<void>> {
  try {
    await executeWithUserId(
      userId,
      sql`DELETE FROM body_records WHERE id = ${id} AND user_id = ${userId}`
    );
    return { isSuccess: true, data: undefined };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : "削除に失敗しました",
    };
  }
}
