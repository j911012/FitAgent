-- FitLog v1.1 シードデータ
-- Neonコンソール（https://console.neon.tech）のSQL Editorで実行する
-- ※事前にアプリにログインしてusersテーブルにレコードを作成しておくこと
--   その後、以下の YOUR_USER_ID を実際のuuidに置き換えて実行する

-- 確認: SELECT id FROM users;

DO $$
DECLARE
  v_user_id uuid := 'YOUR_USER_ID'; -- ← SELECT id FROM users; で取得したUUIDに置き換える
BEGIN

TRUNCATE TABLE body_records, goals RESTART IDENTITY CASCADE;

-- 目標
INSERT INTO goals (user_id, target_weight_kg, target_body_fat)
VALUES (v_user_id, 68.0, 15.0);

-- 体重記録（直近60日分、土日・祝日は記録なしの想定でところどころ欠落させる）
INSERT INTO body_records (user_id, date, weight_kg, body_fat) VALUES
  (v_user_id, '2026-02-11', 75.4, 22.1),
  (v_user_id, '2026-02-12', 75.2, 22.0),
  (v_user_id, '2026-02-14', 75.0, 21.8),
  (v_user_id, '2026-02-16', 74.8, 21.7),
  (v_user_id, '2026-02-18', 74.9, 21.9),
  (v_user_id, '2026-02-19', 74.7, 21.6),
  (v_user_id, '2026-02-21', 74.5, 21.4),
  (v_user_id, '2026-02-23', 74.6, 21.5),
  (v_user_id, '2026-02-25', 74.3, 21.2),
  (v_user_id, '2026-02-26', 74.1, 21.0),
  (v_user_id, '2026-02-28', 73.9, 20.8),
  (v_user_id, '2026-03-02', 73.8, 20.7),
  (v_user_id, '2026-03-04', 73.6, 20.5),
  (v_user_id, '2026-03-05', 73.7, 20.6),
  (v_user_id, '2026-03-07', 73.5, 20.4),
  (v_user_id, '2026-03-09', 73.3, 20.2),
  (v_user_id, '2026-03-11', 73.4, 20.3),
  (v_user_id, '2026-03-12', 73.2, 20.1),
  (v_user_id, '2026-03-14', 73.0, 19.9),
  (v_user_id, '2026-03-16', 72.9, 19.8),
  (v_user_id, '2026-03-18', 73.1, 20.0),
  (v_user_id, '2026-03-19', 72.8, 19.7),
  (v_user_id, '2026-03-21', 72.6, 19.5),
  (v_user_id, '2026-03-23', 72.5, 19.4),
  (v_user_id, '2026-03-25', 72.7, 19.6),
  (v_user_id, '2026-03-26', 72.4, 19.3),
  (v_user_id, '2026-03-28', 72.2, 19.1),
  (v_user_id, '2026-03-30', 72.1, 19.0),
  (v_user_id, '2026-04-01', 72.3, 19.2),
  (v_user_id, '2026-04-02', 72.0, 18.9),
  (v_user_id, '2026-04-04', 71.8, 18.7),
  (v_user_id, '2026-04-06', 71.7, 18.6),
  (v_user_id, '2026-04-07', 71.9, 18.8),
  (v_user_id, '2026-04-09', 71.6, 18.5),
  (v_user_id, '2026-04-11', 71.4, 18.3);

END $$;
