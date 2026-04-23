import { test, expect } from '@playwright/test';

// 目標設定→体重記録→ProgressBar反映までの一貫したユーザーフローを検証する
// 各ステップが前のステップのDB状態に依存するため直列で実行する
test.describe.serial('目標設定から進捗反映までのフロー', () => {
  const TARGET_WEIGHT = '63.0';
  const TARGET_BODY_FAT = '15.0';
  const CURRENT_WEIGHT = '65.3';
  const CURRENT_BODY_FAT = '18.0';
  // ProgressBarの表示値: current - target = 65.3 - 63.0 = 2.3
  const REMAINING_WEIGHT = '残り 2.3kg';
  // ProgressBarの表示値: current - target = 18.0 - 15.0 = 3.0
  const REMAINING_BODY_FAT = '残り 3.0%';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('目標体重・目標体脂肪率を設定できる', async ({ page }) => {
    await page.getByRole('button', { name: '目標を設定' }).click();
    await expect(page.getByPlaceholder('70.0')).toBeVisible();

    await page.getByPlaceholder('70.0').fill(TARGET_WEIGHT);
    await page.getByPlaceholder('15.0').fill(TARGET_BODY_FAT);
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByPlaceholder('70.0')).not.toBeVisible();
  });

  test('体重・体脂肪率を記録できる', async ({ page }) => {
    await page.getByRole('button', { name: '体重を記録' }).first().click();
    await expect(page.getByPlaceholder('75.0')).toBeVisible();

    await page.getByPlaceholder('75.0').fill(CURRENT_WEIGHT);
    await page.getByPlaceholder('18.0').fill(CURRENT_BODY_FAT);
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByPlaceholder('75.0')).not.toBeVisible();
  });

  test('ProgressBarに目標までの残り体重・体脂肪率が表示される', async ({ page }) => {
    // LeftPane（PC）とRightPane（SP）の両方にProgressBarが描画されるため first() で取得する
    await expect(page.getByText(REMAINING_WEIGHT).first()).toBeVisible();
    await expect(page.getByText(REMAINING_BODY_FAT).first()).toBeVisible();
  });
});
