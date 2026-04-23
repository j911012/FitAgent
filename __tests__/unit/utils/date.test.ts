import { describe, it, expect } from 'vitest';
import { formatDateJa, toDateString, getRecentDates, getDateParts, formatShortDate } from '@/utils/date';

describe('formatDateJa', () => {
  it('日本語形式にフォーマットする', () => {
    // 2026-04-19 は日曜日
    const date = new Date(2026, 3, 19); // month は 0-indexed
    expect(formatDateJa(date)).toBe('2026年4月19日（日）');
  });

  it('月・日が1桁でもゼロ埋めしない', () => {
    // 2026-01-05 は月曜日
    const date = new Date(2026, 0, 5);
    expect(formatDateJa(date)).toBe('2026年1月5日（月）');
  });

  it('各曜日が正しく表示される', () => {
    const cases: [number, string][] = [
      [0, '日'], [1, '月'], [2, '火'], [3, '水'], [4, '木'], [5, '金'], [6, '土'],
    ];
    // 2026-04-19（日）を基点に1週間分チェック
    for (const [offset, weekday] of cases) {
      const date = new Date(2026, 3, 19 + offset);
      expect(formatDateJa(date)).toContain(`（${weekday}）`);
    }
  });
});

describe('toDateString', () => {
  it('YYYY-MM-DD 形式で返す', () => {
    const date = new Date(2026, 3, 19); // 2026-04-19
    expect(toDateString(date)).toBe('2026-04-19');
  });

  it('月・日が1桁のときゼロ埋めする', () => {
    const date = new Date(2026, 0, 5); // 2026-01-05
    expect(toDateString(date)).toBe('2026-01-05');
  });

  it('12月31日を正しく変換する', () => {
    const date = new Date(2026, 11, 31); // 2026-12-31
    expect(toDateString(date)).toBe('2026-12-31');
  });
});

describe('getRecentDates', () => {
  it('指定した件数の日付を返す', () => {
    const result = getRecentDates(7);
    expect(result).toHaveLength(7);
  });

  it('古い順（昇順）で返す', () => {
    const result = getRecentDates(3);
    expect(result[0] < result[1]).toBe(true);
    expect(result[1] < result[2]).toBe(true);
  });

  it('末尾が今日の日付', () => {
    const result = getRecentDates(5);
    expect(result[result.length - 1]).toBe(toDateString(new Date()));
  });

  it('n=1 のとき今日だけ返す', () => {
    const result = getRecentDates(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(toDateString(new Date()));
  });
});

describe('getDateParts', () => {
  it('weekday・monthDay・year を返す', () => {
    // 2026-04-19 は Sunday
    const date = new Date(2026, 3, 19);
    expect(getDateParts(date)).toEqual({
      weekday: 'Sunday',
      monthDay: '4月19日',
      year: '2026年',
    });
  });

  it('各曜日が英語で返る', () => {
    const cases: [number, string][] = [
      [0, 'Sunday'], [1, 'Monday'], [2, 'Tuesday'], [3, 'Wednesday'],
      [4, 'Thursday'], [5, 'Friday'], [6, 'Saturday'],
    ];
    for (const [offset, weekday] of cases) {
      const date = new Date(2026, 3, 19 + offset);
      expect(getDateParts(date).weekday).toBe(weekday);
    }
  });
});

describe('formatShortDate', () => {
  it('YYYY-MM-DD を M/D 形式に変換する', () => {
    expect(formatShortDate('2026-04-19')).toBe('4/19');
  });

  it('月・日のゼロ埋めを除去する', () => {
    expect(formatShortDate('2026-01-05')).toBe('1/5');
  });

  it('12月31日を正しく変換する', () => {
    expect(formatShortDate('2026-12-31')).toBe('12/31');
  });
});
