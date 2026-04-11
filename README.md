# FitLog

体重・体脂肪率を記録・可視化する Web アプリ。

## 技術スタック

| カテゴリ       | 技術                        |
| -------------- | --------------------------- |
| フレームワーク | Next.js 16 (App Router)     |
| 言語           | TypeScript                  |
| DB             | Neon (PostgreSQL)           |
| スタイリング   | Tailwind CSS                |
| バリデーション | zod                         |
| コード品質     | ESLint / Prettier           |

## セットアップ

### 1. パッケージインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Neon の接続文字列を設定する。

```bash
cp .env.local.example .env.local
```

### 3. DB セットアップ

[Neon コンソール](https://console.neon.tech) の SQL Editor で `db/schema.sql` を実行してテーブルを作成する。

### 4. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認。

## ディレクトリ構成

```
├── actions/          # Server Actions（データ更新）
│   ├── bodyRecord.ts
│   └── goal.ts
├── app/              # App Router
│   ├── layout.tsx
│   ├── page.tsx      # Server Component（データ取得）
│   └── global-error.tsx
├── components/       # UI コンポーネント
│   ├── Dashboard.tsx
│   ├── Chart.tsx
│   ├── RecordList.tsx
│   ├── RecordModal.tsx
│   ├── SettingsModal.tsx
│   └── ProgressBar.tsx
├── db/
│   └── schema.sql    # テーブル定義
├── docs/
│   └── specs/        # 仕様書
├── lib/
│   └── db.ts         # Neon クライアント
├── types/
│   └── index.ts      # 型定義
└── utils/
    └── date.ts       # 日付ユーティリティ
```

## コード品質チェック

```bash
npm run lint
npx tsc --noEmit
```
