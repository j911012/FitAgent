const WEEKDAY_JA = ['日', '月', '火', '水', '木', '金', '土'] as const;

/**
 * Dateオブジェクトを日本語表記にフォーマットする
 * 例: 「2026年4月5日（日）」
 */
export function formatDateJa(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_JA[date.getDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}

/**
 * DateオブジェクトをローカルタイムゾーンのYYYY-MM-DD形式に変換する
 * toISOString()はUTC基準のため、タイムゾーンずれを避けるために手動フォーマット
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 今日を末尾として、直近n日分の日付文字列を古い順で返す
 * グラフのX軸生成などで使用する
 */
export function getRecentDates(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(toDateString(d));
  }
  return dates;
}

/**
 * 'YYYY-MM-DD'形式の日付文字列を短い表示用 'M/D' に変換する
 * グラフのX軸ラベルで使用する
 */
export function formatShortDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${Number(month)}/${Number(day)}`;
}
