import { test as setup } from '@playwright/test';
import { encode } from 'next-auth/jwt';
import fs from 'fs';
import path from 'path';

const SESSION_FILE = 'e2e/fixtures/.auth/session.json';

/**
 * テスト用の認証済みセッションを生成してストレージステートとして保存する。
 * Google OAuthは外部サービスのためE2Eテストで実行できないため、
 * AUTH_SECRETを使ってJWTトークンを直接生成しcookieに注入する。
 */
setup('認証済みセッションを生成する', async ({ page }) => {
  const secret = process.env.AUTH_SECRET;
  const userId = process.env.E2E_TEST_USER_ID;

  if (!secret) throw new Error('AUTH_SECRET が設定されていません');
  if (!userId) throw new Error('E2E_TEST_USER_ID が設定されていません');

  const token = await encode({
    token: {
      name: 'E2E Test User',
      email: process.env.E2E_TEST_USER_EMAIL ?? 'e2e@example.com',
      picture: null,
      // auth.ts の jwt callback で設定するユーザーID
      userId,
    },
    secret,
    // NextAuth v5 のデフォルト salt
    salt: 'authjs.session-token',
  });

  // ストレージステートの保存先ディレクトリを作成する
  const dir = path.dirname(SESSION_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // アプリにアクセスしてドメインを確定させた上でcookieを注入する
  await page.goto('/login');

  await page.context().addCookies([
    {
      name: 'authjs.session-token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  await page.context().storageState({ path: SESSION_FILE });
});
