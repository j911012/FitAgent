import { z } from 'zod';

// バリデーションはServer Actions側でのみ実施する（クライアントはtype="number"のみ）
export const bodyRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が正しくありません'),
  weight_kg: z
    .number({ error: '体重は数値で入力してください' })
    .min(20, '体重は20.0〜300.0kgの範囲で入力してください')
    .max(300, '体重は20.0〜300.0kgの範囲で入力してください'),
  body_fat: z
    .number({ error: '体脂肪率は数値で入力してください' })
    .min(3, '体脂肪率は3.0〜60.0%の範囲で入力してください')
    .max(60, '体脂肪率は3.0〜60.0%の範囲で入力してください')
    .nullable(),
});

export type BodyRecordInput = z.infer<typeof bodyRecordSchema>;
