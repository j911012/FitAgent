-- FitLog v2.0 マイグレーション
-- Neonコンソール（https://console.neon.tech）のSQL Editorで実行する
-- ※既存の body_records / goals テーブルには影響しない

-- ────────────────────────────────────────────
-- 1. exercises テーブル（種目マスタ）
--    user_id = NULL はグローバルマスタ（シードで投入したプリセット種目）
--    user_id が設定されたレコードはユーザー固有のカスタム種目
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exercises (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid         REFERENCES users(id) ON DELETE CASCADE,
  name       text         NOT NULL,
  body_part  text         NOT NULL,
  is_default boolean      NOT NULL DEFAULT false,
  created_at timestamptz  DEFAULT now(),
  updated_at timestamptz  DEFAULT now(),

  -- 同一ユーザー内での種目名重複防止（NULLは別扱いなのでグローバルマスタ同士の重複は別途管理）
  UNIQUE (user_id, name),

  -- 仕様で定められた部位のみ許可する
  CHECK (body_part IN ('chest', 'back', 'shoulder', 'arm', 'leg', 'abs'))
);


-- ────────────────────────────────────────────
-- 2. workout_sessions テーブル（トレーニングセッション）
--    body_records と異なり UNIQUE(user_id, date) は設定しない（1日複数セッション可）
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_sessions (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       date         NOT NULL,
  created_at timestamptz  DEFAULT now(),
  updated_at timestamptz  DEFAULT now()
);


-- ────────────────────────────────────────────
-- 3. workout_sets テーブル（セット記録）
--    user_id を正規化せず保持する理由: RLSポリシーをJOINなしで適用するため
--    exercise_id は ON DELETE RESTRICT: セット記録に紐づく種目の誤削除を防ぐ
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workout_sets (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id  uuid          NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id uuid          NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  set_number  integer       NOT NULL CHECK (set_number >= 1),
  weight_kg   numeric(5,2)  NOT NULL CHECK (weight_kg >= 0),
  reps        integer       NOT NULL CHECK (reps >= 1),
  memo        text,
  created_at  timestamptz   DEFAULT now(),
  updated_at  timestamptz   DEFAULT now(),

  -- 同一セッション・同一種目内でのセット番号重複防止
  UNIQUE (session_id, exercise_id, set_number)
);


-- ────────────────────────────────────────────
-- 4. Row Level Security（RLS）設定
-- ────────────────────────────────────────────

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS exercises_select_policy ON exercises;
DROP POLICY IF EXISTS exercises_write_policy ON exercises;
DROP POLICY IF EXISTS workout_sessions_user_policy ON workout_sessions;
DROP POLICY IF EXISTS workout_sets_user_policy ON workout_sets;

-- グローバルマスタ（user_id IS NULL）は全ユーザーが閲覧可能
-- カスタム種目は自分のものだけ閲覧可能
CREATE POLICY exercises_select_policy ON exercises
  FOR SELECT
  USING (
    user_id IS NULL
    OR user_id = current_setting('app.current_user_id', true)::uuid
  );

-- カスタム種目の作成・更新・削除は自分のものだけ
CREATE POLICY exercises_write_policy ON exercises
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- セッション・セットは自分のデータのみ
CREATE POLICY workout_sessions_user_policy ON workout_sessions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY workout_sets_user_policy ON workout_sets
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
