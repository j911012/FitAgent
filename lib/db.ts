import { neon, type NeonQueryPromise } from '@neondatabase/serverless';

// DATABASE_URLはサーバー側でのみ参照される環境変数（クライアントに露出させない）
const sql = neon(process.env.DATABASE_URL!);

// Neon RLS用にapp.current_user_idをSETした状態でクエリを実行する共通関数
// HTTPプロトコルでは各クエリが独立したセッションになるため、
// transactionで一括送信してSET LOCALを同一トランザクション内に収める
// これによりRLSポリシー(current_setting('app.current_user_id'))が正しく評価される
export async function executeWithUserId(
  userId: string,
  query: NeonQueryPromise<false, false>
): Promise<Record<string, unknown>[]> {
  const [, rows] = await sql.transaction([
    sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
    query,
  ]);
  return rows as Record<string, unknown>[];
}

export default sql;
