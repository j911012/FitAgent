import sql, { executeWithUserId } from '@/lib/db';
import type { Result } from '@/types';
import type { Exercise, WorkoutSession, WorkoutSet, WorkoutSessionDetail, WorkoutSessionSummary, WorkoutSessionFilter } from '../types';
import type { WorkoutSessionInput } from '../schemas/workoutSession';

const PAGE_SIZE = 20;

// フィルタの期間指定をSQL用の開始日文字列に変換する
function toStartDate(range: WorkoutSessionFilter['range']): string | null {
  if (!range || range === 'all') return null;
  const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function mapSummaryRow(row: Record<string, unknown>): WorkoutSessionSummary {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    date: row.date instanceof Date
      ? row.date.toISOString().slice(0, 10)
      : String(row.date),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    // PostgreSQLのCOUNT/SUMはドライバーが文字列で返すためNumber()でパースする
    exerciseCount: Number(row.exercise_count),
    totalSets: Number(row.total_sets),
    totalVolume: Number(row.total_volume),
  };
}

// セッション一覧を集計付きで取得する（フィルタ・ページネーション対応）
export async function fetchWorkoutSessions(
  userId: string,
  filter: WorkoutSessionFilter = {}
): Promise<Result<WorkoutSessionSummary[]>> {
  const { exerciseId = null, page = 1 } = filter;
  const startDate = toStartDate(filter.range);
  const offset = (page - 1) * PAGE_SIZE;

  try {
    // exercise_idフィルタはEXISTSサブクエリで対応し、NULLの場合は全件対象とする
    const rows = await executeWithUserId(
      userId,
      sql`
        SELECT
          ws.id,
          ws.user_id,
          ws.date,
          ws.created_at,
          ws.updated_at,
          COUNT(DISTINCT wset.exercise_id)::integer AS exercise_count,
          COUNT(wset.id)::integer               AS total_sets,
          COALESCE(SUM(wset.weight_kg * wset.reps), 0) AS total_volume
        FROM workout_sessions ws
        LEFT JOIN workout_sets wset ON wset.session_id = ws.id
        WHERE ws.user_id = ${userId}
          AND (
            ${exerciseId}::uuid IS NULL
            OR EXISTS (
              SELECT 1 FROM workout_sets
              WHERE session_id = ws.id AND exercise_id = ${exerciseId}::uuid
            )
          )
          AND (${startDate}::date IS NULL OR ws.date >= ${startDate}::date)
        GROUP BY ws.id
        ORDER BY ws.date DESC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `
    );
    return { isSuccess: true, data: rows.map(mapSummaryRow) };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : 'セッションの取得に失敗しました',
    };
  }
}

// セッション詳細（セット＋種目情報）を取得する（編集ページ用）
export async function fetchWorkoutSessionDetail(
  sessionId: string,
  userId: string
): Promise<Result<WorkoutSessionDetail | null>> {
  try {
    const rows = await executeWithUserId(
      userId,
      sql`
        SELECT
          ws.id          AS session_id,
          ws.user_id,
          ws.date,
          ws.created_at,
          ws.updated_at,
          wset.id        AS set_id,
          wset.exercise_id,
          wset.set_number,
          wset.weight_kg,
          wset.reps,
          wset.memo,
          wset.created_at AS set_created_at,
          wset.updated_at AS set_updated_at,
          e.id           AS ex_id,
          e.user_id      AS ex_user_id,
          e.name         AS ex_name,
          e.body_part,
          e.is_default,
          e.created_at   AS ex_created_at,
          e.updated_at   AS ex_updated_at
        FROM workout_sessions ws
        LEFT JOIN workout_sets wset ON wset.session_id = ws.id
        LEFT JOIN exercises e ON e.id = wset.exercise_id
        WHERE ws.id = ${sessionId} AND ws.user_id = ${userId}
        ORDER BY wset.exercise_id, wset.set_number
      `
    );

    if (rows.length === 0) return { isSuccess: true, data: null };

    const first = rows[0];
    const session: WorkoutSession = {
      id: first.session_id as string,
      user_id: first.user_id as string,
      date: first.date instanceof Date
        ? first.date.toISOString().slice(0, 10)
        : String(first.date),
      created_at: String(first.created_at),
      updated_at: String(first.updated_at),
    };

    // JOIN結果の複数行をsets配列に集約する（LEFT JOINなのでset_idがnullの行はセットなし）
    const sets: (WorkoutSet & { exercise: Exercise })[] = rows
      .filter((r) => r.set_id != null)
      .map((r) => ({
        id: r.set_id as string,
        user_id: r.user_id as string,
        session_id: session.id,
        exercise_id: r.exercise_id as string,
        set_number: Number(r.set_number),
        weight_kg: Number(r.weight_kg),
        reps: Number(r.reps),
        memo: r.memo as string | null,
        created_at: String(r.set_created_at),
        updated_at: String(r.set_updated_at),
        exercise: {
          id: r.ex_id as string,
          user_id: r.ex_user_id as string | null,
          name: r.ex_name as string,
          body_part: r.body_part as Exercise['body_part'],
          is_default: r.is_default as boolean,
          created_at: String(r.ex_created_at),
          updated_at: String(r.ex_updated_at),
        },
      }));

    return { isSuccess: true, data: { ...session, sets } };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : 'セッションの取得に失敗しました',
    };
  }
}

// セッションとセットをトランザクションで一括作成する
export async function createWorkoutSession(
  input: WorkoutSessionInput,
  userId: string
): Promise<Result<{ id: string }>> {
  try {
    const [, sessionRows] = await sql.transaction([
      sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
      sql`
        INSERT INTO workout_sessions (user_id, date)
        VALUES (${userId}, ${input.date})
        RETURNING id
      `,
    ]);

    const sessionId = (sessionRows as Record<string, unknown>[])[0].id as string;

    // セットが存在する場合のみINSERTを実行する（zodで1件以上保証されているが念のため）
    if (input.sets.length > 0) {
      const setInserts = input.sets.map(
        (set) => sql`
          INSERT INTO workout_sets (user_id, session_id, exercise_id, set_number, weight_kg, reps, memo)
          VALUES (${userId}, ${sessionId}, ${set.exercise_id}, ${set.set_number}, ${set.weight_kg}, ${set.reps}, ${set.memo ?? null})
        `
      );
      await sql.transaction([
        sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
        ...setInserts,
      ]);
    }

    return { isSuccess: true, data: { id: sessionId } };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : 'セッションの作成に失敗しました',
    };
  }
}

// セッションを更新する: セッション本体はUPDATE、セットは全削除→再INSERTで整合性を担保する
export async function updateWorkoutSession(
  sessionId: string,
  input: WorkoutSessionInput,
  userId: string
): Promise<Result<void>> {
  try {
    const setInserts = input.sets.map(
      (set) => sql`
        INSERT INTO workout_sets (user_id, session_id, exercise_id, set_number, weight_kg, reps, memo)
        VALUES (${userId}, ${sessionId}, ${set.exercise_id}, ${set.set_number}, ${set.weight_kg}, ${set.reps}, ${set.memo ?? null})
      `
    );

    await sql.transaction([
      sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
      sql`
        UPDATE workout_sessions
        SET date = ${input.date}, updated_at = now()
        WHERE id = ${sessionId} AND user_id = ${userId}
      `,
      // 差分計算より全入れ替えの方がセット追加・削除・並び替えの整合性が取りやすい
      sql`DELETE FROM workout_sets WHERE session_id = ${sessionId}`,
      ...setInserts,
    ]);

    return { isSuccess: true, data: undefined };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : 'セッションの更新に失敗しました',
    };
  }
}

// セッションを削除する（workout_setsはON DELETE CASCADEで自動削除される）
export async function deleteWorkoutSession(
  sessionId: string,
  userId: string
): Promise<Result<void>> {
  try {
    await executeWithUserId(
      userId,
      sql`DELETE FROM workout_sessions WHERE id = ${sessionId} AND user_id = ${userId}`
    );
    return { isSuccess: true, data: undefined };
  } catch (error) {
    return {
      isSuccess: false,
      errorMessage: error instanceof Error ? error.message : 'セッションの削除に失敗しました',
    };
  }
}
