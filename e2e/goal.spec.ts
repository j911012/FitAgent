import { test, expect } from '@playwright/test';

test('目標を設定できる', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '目標を設定' }).click();

  // 入力欄が表示されたことでモーダルが開いたと判断する
  await expect(page.getByPlaceholder('70.0')).toBeVisible();

  await page.getByPlaceholder('70.0').fill('63.0');
  await page.getByRole('button', { name: '保存' }).click();

  // モーダルが閉じたことを確認する
  await expect(page.getByPlaceholder('70.0')).not.toBeVisible();
});
