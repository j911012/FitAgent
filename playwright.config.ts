import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

// Playwrightは Next.js とは別プロセスのため .env.local を明示的に読み込む
config({ path: '.env.local' });

export default defineConfig({
  testDir: './e2e',
  // 各テストファイルを並列実行する（ファイル間は独立）
  fullyParallel: true,
  // CI環境ではリトライを2回まで許容する
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // 認証済みセッションのセットアップを全テストの前に実行する
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // セットアップで生成した認証済みストレージを使用する
        storageState: 'e2e/fixtures/.auth/session.json',
      },
      dependencies: ['setup'],
    },
  ],

  // テスト実行前に開発サーバーを起動する
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
