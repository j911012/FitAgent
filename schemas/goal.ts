import { z } from 'zod';

// 目標体重・目標体脂肪率はどちらも任意（片方だけでも設定可能）
export const goalSchema = z.object({
  target_weight_kg: z
    .number({ error: '目標体重は数値で入力してください' })
    .min(20, '目標体重は20.0〜300.0kgの範囲で入力してください')
    .max(300, '目標体重は20.0〜300.0kgの範囲で入力してください')
    .nullable(),
  target_body_fat: z
    .number({ error: '目標体脂肪率は数値で入力してください' })
    .min(3, '目標体脂肪率は3.0〜60.0%の範囲で入力してください')
    .max(60, '目標体脂肪率は3.0〜60.0%の範囲で入力してください')
    .nullable(),
});

export type GoalInput = z.infer<typeof goalSchema>;
