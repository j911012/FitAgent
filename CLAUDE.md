# FitLog — CLAUDE.md

## 現在のフェーズ

**v1.1 MVP**

仕様の詳細はすべて `docs/specs/v2.0_requirements.md` を参照すること。
実装前に必ず仕様書を確認し、乖離しないようにする。

## ルールファイル

実装前に必ず対応するルールファイルを参照すること。

| ファイル                                     | 参照タイミング                 |
| -------------------------------------------- | ------------------------------ |
| `.claude/rules/01_directory.rules.md`        | ファイル作成・配置場所の判断時 |
| `.claude/rules/02_components.rules.md`       | コンポーネント設計・分割時     |
| `.claude/rules/03_data-fetching.rules.md`    | データ取得の実装時             |
| `.claude/rules/04_data-mutation.rules.md`    | 登録・更新・削除の実装時       |
| `.claude/rules/05_state-management.rules.md` | 状態管理の実装時               |
| `.claude/rules/06_cache-strategy.rules.md`   | キャッシュ制御の実装時         |
| `.claude/rules/07_error-handling.rules.md`   | エラー処理の実装時             |

## コーディング規約

- コメントは**意図・背景**を記載する（何をしているかではなく、なぜそうしているか）
- ライブラリのhooks・プロパティには必ず用途コメントを付ける
- `any`型禁止。`unknown`を使い型ガードで絞り込む
