import { test, expect } from '@playwright/test';

// URL駆動フィルタのUIテスト
// データの有無に依存せず、フィルタ操作がURLに正しく反映されるかを確認する
test.describe('セッション一覧フィルタ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workouts');
  });

  test('部位フィルタを選択するとURLに反映される', async ({ page }) => {
    // 胸フィルタの select を選択する
    await page.locator('select').first().selectOption('chest');

    await expect(page).toHaveURL(/[?&]bodyPart=chest/);
  });

  test('期間フィルタを選択するとURLに反映される', async ({ page }) => {
    await page.locator('select').last().selectOption('7days');

    await expect(page).toHaveURL(/[?&]range=7days/);
  });

  test('部位を変更すると種目フィルタがリセットされる', async ({ page }) => {
    // まず種目フィルタを選択する（FilterBarの2番目のselect）
    const exerciseSelect = page.locator('select').nth(1);
    const firstOption = exerciseSelect.locator('option').nth(1);
    const firstValue = await firstOption.getAttribute('value');

    if (firstValue) {
      await exerciseSelect.selectOption(firstValue);
      await expect(page).toHaveURL(/[?&]exercise=/);

      // 部位フィルタを変更する → 種目フィルタがリセットされる
      await page.locator('select').first().selectOption('back');
      await expect(page).toHaveURL(/[?&]bodyPart=back/);
      await expect(page).not.toHaveURL(/[?&]exercise=/);
    }
  });

  test('フィルタをリセットするとURLパラメータが消える', async ({ page }) => {
    await page.locator('select').last().selectOption('30days');
    await expect(page).toHaveURL(/[?&]range=30days/);

    // 全期間に戻す
    await page.locator('select').last().selectOption('all');
    await expect(page).not.toHaveURL(/[?&]range=/);
  });
});
