-- FitLog v1.0 データベーススキーマ
-- Neonコンソール（https://console.neon.tech）のSQL Editorで実行する

CREATE TABLE body_records (
  id         uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  date       date          NOT NULL UNIQUE,
  weight_kg  numeric(4,1)  NOT NULL,
  body_fat   numeric(4,1),
  created_at timestamptz   DEFAULT now(),
  updated_at timestamptz   DEFAULT now()
);

CREATE TABLE goals (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  target_weight_kg numeric(4,1),
  target_body_fat  numeric(4,1),
  created_at       timestamptz   DEFAULT now(),
  updated_at       timestamptz   DEFAULT now()
);
