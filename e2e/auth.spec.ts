import { test, expect } from '@playwright/test';

test('認証済みセッションでダッシュボードにアクセスできる', async ({ page }) => {
  await page.goto('/');

  // ログインページにリダイレクトされずダッシュボードが表示されることを確認する
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('button', { name: '体重を記録' }).first()).toBeVisible();
});
