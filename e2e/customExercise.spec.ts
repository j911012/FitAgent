import { test, expect } from '@playwright/test';

const CUSTOM_NAME = 'E2Eテスト種目';
const UPDATED_NAME = 'E2Eテスト種目（更新）';

// 追加→編集→削除を直列で実行し、最後にクリーンアップする
test.describe.serial('カスタム種目 CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workouts/new');
    await page.getByRole('button', { name: '+ 種目を追加' }).click();
    // TanStack Queryのフェッチ完了を待つ
    await expect(page.getByText('ベンチプレス').first()).toBeVisible();
  });

  test('カスタム種目を追加できる', async ({ page }) => {
    await page.getByRole('button', { name: '+ カスタム種目を追加' }).click();

    // フォームに入力する（PC・SP で2要素あるため first() を使う）
    await page.getByPlaceholder('種目名').first().fill(CUSTOM_NAME);
    await page.locator('select').first().selectOption('back');
    await page.getByRole('button', { name: '保存' }).first().click();

    // 一覧に表示される
    await expect(page.getByText(CUSTOM_NAME).first()).toBeVisible();
  });

  test('カスタム種目を編集できる', async ({ page }) => {
    // 追加したカスタム種目の行を探して編集ボタンをクリックする
    const row = page.locator('div').filter({ hasText: CUSTOM_NAME }).filter({ hasText: '編集' }).first();
    await row.getByRole('button', { name: '編集' }).click();

    // 名前を変更して保存する（PC・SP で2要素あるため first() を使う）
    await page.getByPlaceholder('種目名').first().fill(UPDATED_NAME);
    await page.getByRole('button', { name: '保存' }).first().click();

    // 変更が反映される
    await expect(page.getByText(UPDATED_NAME).first()).toBeVisible();
    await expect(page.getByText(CUSTOM_NAME, { exact: true }).first()).not.toBeVisible();
  });

  test('カスタム種目を削除できる', async ({ page }) => {
    const row = page.locator('div').filter({ hasText: UPDATED_NAME }).filter({ hasText: '削除' }).first();
    await row.getByRole('button', { name: '削除' }).click();

    // 一覧から消える
    await expect(page.getByText(UPDATED_NAME, { exact: true }).first()).not.toBeVisible();
  });
});
