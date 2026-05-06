import { test, expect } from '@playwright/test';

// 新規作成→下書き→完了→同日リダイレクト→編集→削除を直列で実行する
// 各テストが前のDB・localStorage状態を引き継ぐため直列実行とする
test.describe.serial('セッション CRUD + 下書き', () => {
  // 前回のテスト実行で残ったセッションをすべて削除してクリーンな状態にする
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'e2e/fixtures/.auth/session.json',
    });
    const page = await context.newPage();
    await page.goto('/workouts');
    await page.evaluate(() => localStorage.removeItem('workout-draft'));

    const cards = page.locator('a[href^="/workouts/"]:not([href="/workouts/new"])');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await page.locator('a[href^="/workouts/"]:not([href="/workouts/new"])').first().click();
      await page.getByRole('button', { name: '削除' }).first().click();
      await page.getByRole('button', { name: '削除' }).last().click();
      await page.waitForURL('/workouts');
    }

    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/workouts');
  });

  test('下書きが自動保存され、再訪問時に復元される', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('workout-draft'));

    // PC・SP で2つある「+ 新しいセッション」リンクのうち最初を使う
    await page.getByRole('link', { name: '+ 新しいセッション' }).first().click();
    await expect(page).toHaveURL('/workouts/new');

    // 種目を追加する（TanStack Queryの非同期ロードを待つ）
    await page.getByRole('button', { name: '+ 種目を追加' }).click();
    await expect(page.getByText('ベンチプレス').first()).toBeVisible();
    await page.getByText('ベンチプレス').first().click();

    // セットを入力する
    await page.getByPlaceholder('kg').fill('80');
    await page.getByPlaceholder('回').fill('5');

    // 離脱する
    await page.goto('/workouts');

    // 下書き再開バナーが表示される
    await expect(page.getByText('入力中のトレーニングがあります')).toBeVisible();

    // 再開して下書きが復元されていることを確認する
    await page.getByRole('button', { name: '再開' }).click();
    await expect(page).toHaveURL('/workouts/new');
    // ExerciseGroup の見出しは <span> のため、<option> を誤検出しないよう span に絞る
    await expect(page.locator('span').filter({ hasText: 'ベンチプレス' }).first()).toBeVisible();
  });

  test('セッションを完了でき、一覧に表示される', async ({ page }) => {
    await page.getByRole('link', { name: '+ 新しいセッション' }).first().click();
    await expect(page).toHaveURL('/workouts/new');

    // このテストはドラフト復元に依存せず、その場で種目を追加して完了する
    await page.getByRole('button', { name: '+ 種目を追加' }).click();
    await expect(page.getByText('ベンチプレス').first()).toBeVisible();
    await page.getByText('ベンチプレス').first().click();
    await page.getByPlaceholder('kg').fill('80');
    await page.getByPlaceholder('回').fill('5');

    await page.getByRole('button', { name: '完了' }).click();

    // 編集ページへ遷移する（/workouts/new ではない /workouts/[id]）
    await expect(page).toHaveURL(/\/workouts\/(?!new).+/);

    // 一覧に戻るとセッションカードが存在する
    await page.getByRole('link', { name: '← 戻る' }).click();
    await expect(page).toHaveURL('/workouts');
    await expect(page.getByText('まだトレーニング記録がありません')).not.toBeVisible();

    // 完了後は再開バナーが表示されない
    await expect(page.getByText('入力中のトレーニングがあります')).not.toBeVisible();
  });

  test('今日のセッションが存在するとき、新規作成ボタンで編集ページにリダイレクトされる', async ({ page }) => {
    await page.getByRole('link', { name: '+ 新しいセッション' }).first().click();

    // /workouts/new ではなく編集ページ（/workouts/[id]）にリダイレクトされる
    await expect(page).toHaveURL(/\/workouts\/(?!new).+/);
  });

  test('セッションを編集できる', async ({ page }) => {
    // セッションカードをクリックして編集ページへ遷移する（/workouts/new 以外の /workouts/* リンク）
    await page.locator('a[href^="/workouts/"]:not([href="/workouts/new"])').first().click();
    await expect(page).toHaveURL(/\/workouts\/(?!new).+/);

    // 種目を追加する（TanStack Queryの非同期ロードを待つ）
    await page.getByRole('button', { name: '+ 種目を追加' }).click();
    await expect(page.getByText('ダンベルフライ').first()).toBeVisible();
    await page.getByText('ダンベルフライ').first().click();
    await page.getByPlaceholder('kg').last().fill('20');
    await page.getByPlaceholder('回').last().fill('12');

    // 保存する
    await page.getByRole('button', { name: '保存' }).click();

    // 追加した種目が反映されている（ExerciseGroupの見出しspanで確認）
    await expect(page.locator('span').filter({ hasText: 'ダンベルフライ' }).first()).toBeVisible();
  });

  test('セッションを削除でき、一覧から消える', async ({ page }) => {
    await page.locator('a[href^="/workouts/"]:not([href="/workouts/new"])').first().click();

    // 削除ボタン（ヘッダー）→ 確認モーダル → 削除（モーダル内）
    await page.getByRole('button', { name: '削除' }).first().click();
    await expect(page.getByText('セッションを削除しますか？').first()).toBeVisible();
    await page.getByRole('button', { name: '削除' }).last().click();

    // 一覧へ遷移し、空状態になる
    await expect(page).toHaveURL('/workouts');
    await expect(page.getByText('まだトレーニング記録がありません')).toBeVisible();
  });
});
