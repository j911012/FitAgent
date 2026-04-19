-- FitLog v1.1 データベーススキーマ
-- Neonコンソール（https://console.neon.tech）のSQL Editorで実行する

CREATE TABLE users (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text,
  email      text         UNIQUE,
  image      text,
  created_at timestamptz  DEFAULT now(),
  updated_at timestamptz  DEFAULT now()
);

CREATE TABLE body_records (
  id         uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date       date          NOT NULL,
  weight_kg  numeric(4,1)  NOT NULL,
  body_fat   numeric(4,1),
  created_at timestamptz   DEFAULT now(),
  updated_at timestamptz   DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE TABLE goals (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  target_weight_kg numeric(4,1),
  target_body_fat  numeric(4,1),
  created_at       timestamptz   DEFAULT now(),
  updated_at       timestamptz   DEFAULT now()
);

-- Row Level Security
ALTER TABLE body_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY body_records_user_policy ON body_records
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY goals_user_policy ON goals
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
