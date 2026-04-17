-- FitLog v1.1 マイグレーション
-- Neonコンソール（https://console.neon.tech）のSQL Editorで実行する
-- ※開発環境のみ。既存データは全削除される。

-- ────────────────────────────────────────────
-- 1. 既存データをリセット
-- ────────────────────────────────────────────
TRUNCATE TABLE body_records, goals RESTART IDENTITY CASCADE;


-- ────────────────────────────────────────────
-- 2. users テーブル作成
--    Auth.jsのjwt callbackがUPSERTするユーザー情報を保持する
--    emailをUNIQUEキーとして同一Googleアカウントの重複登録を防ぐ
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text,
  email      text         UNIQUE,
  image      text,
  created_at timestamptz  DEFAULT now(),
  updated_at timestamptz  DEFAULT now()
);


-- ────────────────────────────────────────────
-- 3. body_records に user_id カラム追加
-- ────────────────────────────────────────────

-- user_idカラムを追加（最初はNULL許容で追加し、制約は後から付与する）
ALTER TABLE body_records
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- v1.0のUNIQUE(date)制約を削除し、UNIQUE(user_id, date)に変更する
-- 同一ユーザーの同日重複を防ぎつつ、異なるユーザーの同日記録は許容する
ALTER TABLE body_records DROP CONSTRAINT IF EXISTS body_records_date_key;
ALTER TABLE body_records ADD CONSTRAINT body_records_user_id_date_key UNIQUE (user_id, date);

-- 既存データが0件のためNOT NULL制約を付与する
ALTER TABLE body_records ALTER COLUMN user_id SET NOT NULL;


-- ────────────────────────────────────────────
-- 4. goals に user_id カラム追加
-- ────────────────────────────────────────────

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- 1ユーザー1レコードを保証するUNIQUE制約を追加する
ALTER TABLE goals ADD CONSTRAINT goals_user_id_key UNIQUE (user_id);

ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;


-- ────────────────────────────────────────────
-- 5. Row Level Security（RLS）設定
--    アプリ層のWHERE句とは独立したDB層のアクセス制御
--    Server Actionsで SET LOCAL app.current_user_id = '<uuid>' を実行してから
--    クエリを発行することでポリシーが評価される
-- ────────────────────────────────────────────

ALTER TABLE body_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーがあれば削除して再作成する
DROP POLICY IF EXISTS body_records_user_policy ON body_records;
DROP POLICY IF EXISTS goals_user_policy ON goals;

-- ログインユーザーは自分のレコードのみ操作可能
CREATE POLICY body_records_user_policy ON body_records
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY goals_user_policy ON goals
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
