import { test, expect } from '@playwright/test';

// upsertの仕様上、同じ日付で上書きされるため登録→編集→削除を直列で実行する
test.describe.serial('体重記録 CRUD', () => {
  const TEST_WEIGHT = '65.3';
  const UPDATED_WEIGHT = '64.8';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('体重を記録できる', async ({ page }) => {
    // PC左ペインとSP FABの両方に「体重を記録」ボタンが存在するため first() で取得する
    await page.getByRole('button', { name: '体重を記録' }).first().click();

    // 入力欄が表示されたことでモーダルが開いたと判断する（PC・SPで2要素あるため first() で取得）
    await expect(page.getByPlaceholder('体重 (kg) を入力').first()).toBeVisible();

    await page.getByPlaceholder('体重 (kg) を入力').first().fill(TEST_WEIGHT);
    await page.getByRole('button', { name: '保存' }).click();

    // モーダルが閉じたことを確認する
    await expect(page.getByPlaceholder('体重 (kg) を入力').first()).not.toBeVisible();

    // revalidatePath後の再レンダリングで記録一覧に体重が表示されることを確認する
    await expect(page.getByText(`${TEST_WEIGHT} kg`)).toBeVisible();
  });

  test('体重記録を編集できる', async ({ page }) => {
    // PC・SP で同じレコードに対して2つの編集ボタンが描画されるため first() で取得する
    await page.getByRole('button', { name: '編集' }).first().click();

    // 編集モーダルが開いたことを確認する
    await expect(page.getByText('記録を編集')).toBeVisible();

    await page.getByPlaceholder('体重 (kg) を入力').first().fill(UPDATED_WEIGHT);
    await page.getByRole('button', { name: '保存' }).click();

    // 更新後の体重が記録一覧に反映されることを確認する
    await expect(page.getByText(`${UPDATED_WEIGHT} kg`)).toBeVisible();
  });

  test('体重記録を削除できる', async ({ page }) => {
    await expect(page.getByText(`${UPDATED_WEIGHT} kg`)).toBeVisible();

    // PC・SP で同じレコードに対して2つの削除ボタンが描画されるため first() で取得する
    await page.getByRole('button', { name: '削除' }).first().click();

    // 削除後に対象の記録が一覧から消えることを確認する
    await expect(page.getByText(`${UPDATED_WEIGHT} kg`)).not.toBeVisible();
  });
});
