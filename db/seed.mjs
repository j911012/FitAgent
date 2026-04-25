// ダミーデータ投入スクリプト
// 実行: node --env-file=.env.local db/seed.mjs
//
// .env.local の DATABASE_URL と E2E_TEST_USER_ID を使用する。
// 既存レコードは UPSERT (ON CONFLICT DO UPDATE) で上書きするため、
// 繰り返し実行しても安全。

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const userId = process.env.E2E_TEST_USER_ID;

if (!userId) {
  console.error('E2E_TEST_USER_ID が .env.local に設定されていません');
  process.exit(1);
}

// --- ダミーデータ: 直近60日分の体重・体脂肪率記録 ---
// 週2〜3日のペースで記録（土日は欠落あり）
const records = [
  ['2026-02-25', 75.4, 22.1],
  ['2026-02-26', 75.2, 22.0],
  ['2026-02-28', 75.0, 21.8],
  ['2026-03-02', 74.8, 21.7],
  ['2026-03-04', 74.9, 21.9],
  ['2026-03-05', 74.7, 21.6],
  ['2026-03-07', 74.5, 21.4],
  ['2026-03-09', 74.6, 21.5],
  ['2026-03-11', 74.3, 21.2],
  ['2026-03-12', 74.1, 21.0],
  ['2026-03-14', 73.9, 20.8],
  ['2026-03-16', 73.8, 20.7],
  ['2026-03-18', 73.6, 20.5],
  ['2026-03-19', 73.7, 20.6],
  ['2026-03-21', 73.5, 20.4],
  ['2026-03-23', 73.3, 20.2],
  ['2026-03-25', 73.4, 20.3],
  ['2026-03-26', 73.2, 20.1],
  ['2026-03-28', 73.0, 19.9],
  ['2026-03-30', 72.9, 19.8],
  ['2026-04-01', 73.1, 20.0],
  ['2026-04-02', 72.8, 19.7],
  ['2026-04-04', 72.6, 19.5],
  ['2026-04-06', 72.5, 19.4],
  ['2026-04-07', 72.7, 19.6],
  ['2026-04-09', 72.4, 19.3],
  ['2026-04-11', 72.2, 19.1],
  ['2026-04-13', 72.1, 19.0],
  ['2026-04-14', 72.3, 19.2],
  ['2026-04-16', 72.0, 18.9],
  ['2026-04-18', 71.8, 18.7],
  ['2026-04-19', 71.7, 18.6],
  ['2026-04-21', 71.9, 18.8],
  ['2026-04-23', 71.6, 18.5],
  ['2026-04-24', 71.4, 18.4],
  ['2026-04-25', 71.2, 18.2],
];

async function seed() {
  console.log(`userId: ${userId}`);

  // 目標を UPSERT
  await sql`
    INSERT INTO goals (user_id, target_weight_kg, target_body_fat)
    VALUES (${userId}, 68.0, 15.0)
    ON CONFLICT (user_id) DO UPDATE
      SET target_weight_kg = EXCLUDED.target_weight_kg,
          target_body_fat  = EXCLUDED.target_body_fat,
          updated_at       = now()
  `;
  console.log('✓ goals upserted');

  // 体重記録を UPSERT（日付が重複してもエラーにならない）
  for (const [date, weight_kg, body_fat] of records) {
    await sql`
      INSERT INTO body_records (user_id, date, weight_kg, body_fat)
      VALUES (${userId}, ${date}, ${weight_kg}, ${body_fat})
      ON CONFLICT (user_id, date) DO UPDATE
        SET weight_kg  = EXCLUDED.weight_kg,
            body_fat   = EXCLUDED.body_fat,
            updated_at = now()
    `;
  }
  console.log(`✓ body_records upserted (${records.length} rows)`);

  console.log('シード完了');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
