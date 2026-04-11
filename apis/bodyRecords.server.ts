import sql from "@/lib/db";
import type { BodyRecord, Result } from "@/types";
import type { BodyRecordInput } from "@/schemas/bodyRecord";

// PostgreSQLのnumeric型はJSONシリアライズ時に文字列で返ってくるためNumber()でパースする
function mapRow(row: Record<string, unknown>): BodyRecord {
  return {
    id: row.id as string,
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

// 全レコードを新しい順で取得する
// 一覧表示・最新値表示・グラフ表示すべてをこの1回のクエリで賄う
export async function fetchBodyRecords(): Promise<Result<BodyRecord[]>> {
  try {
    const rows = await sql`
      SELECT id, date, weight_kg, body_fat, created_at, updated_at
      FROM body_records
      ORDER BY date DESC
    `;
    return { isSuccess: true, data: rows.map((row) => mapRow(row)) };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage:
        error instanceof Error ? error.message : "データの取得に失敗しました",
    };
  }
}

// 体重記録を登録または更新する（同日レコードはUPSERT）
// date は UNIQUE 制約があるため ON CONFLICT で上書きする
export async function upsertBodyRecord(input: BodyRecordInput): Promise<Result<void>> {
  try {
    await sql`
      INSERT INTO body_records (date, weight_kg, body_fat)
      VALUES (${input.date}, ${input.weight_kg}, ${input.body_fat})
      ON CONFLICT (date) DO UPDATE
        SET weight_kg  = EXCLUDED.weight_kg,
            body_fat   = EXCLUDED.body_fat,
            updated_at = now()
    `;
    return { isSuccess: true, data: undefined };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : "保存に失敗しました",
    };
  }
}

// 体重記録を削除する
export async function deleteBodyRecord(id: string): Promise<Result<void>> {
  try {
    await sql`DELETE FROM body_records WHERE id = ${id}`;
    return { isSuccess: true, data: undefined };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : "削除に失敗しました",
    };
  }
}
