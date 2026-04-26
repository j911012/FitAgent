-- FitLog v2.0 シード（プリセット種目）
-- migration_v2.0.sql 実行後に1度だけ実行する
-- user_id = NULL: 全ユーザー共通のグローバルマスタ
-- is_default = true: プリセット種目フラグ（UI上での削除を禁止するための判定に使用）

INSERT INTO exercises (user_id, name, body_part, is_default) VALUES
  -- 胸
  (NULL, 'ベンチプレス',               'chest',    true),
  (NULL, 'インクラインダンベルプレス', 'chest',    true),
  (NULL, 'ダンベルフライ',             'chest',    true),
  -- 背中
  (NULL, 'デッドリフト',               'back',     true),
  (NULL, '懸垂',                       'back',     true),
  (NULL, 'ラットプルダウン',           'back',     true),
  (NULL, 'ベントオーバーロウ',         'back',     true),
  -- 肩
  (NULL, 'ショルダープレス',           'shoulder', true),
  (NULL, 'サイドレイズ',               'shoulder', true),
  -- 腕
  (NULL, 'バーベルカール',             'arm',      true),
  (NULL, 'トライセプスエクステンション', 'arm',    true),
  -- 脚
  (NULL, 'スクワット',                 'leg',      true),
  (NULL, 'ルーマニアンデッドリフト',   'leg',      true),
  (NULL, 'レッグプレス',               'leg',      true),
  (NULL, 'レッグカール',               'leg',      true),
  -- 腹
  (NULL, 'クランチ',                   'abs',      true)
ON CONFLICT DO NOTHING;
