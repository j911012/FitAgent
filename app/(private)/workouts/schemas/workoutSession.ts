import { z } from 'zod';

export const workoutSetSchema = z.object({
  exercise_id: z.string().uuid({ message: '種目が正しく選択されていません' }),
  set_number: z.number().int().min(1, 'セット番号は1以上を入力してください'),
  weight_kg: z
    .number({ error: '重量を入力してください' })
    .min(0, '重量は0kg以上で入力してください')
    .max(1000, '重量は1000kg以内で入力してください')
    .multipleOf(0.01),
  reps: z
    .number({ error: 'レップ数を入力してください' })
    .int()
    .min(1, 'レップ数は1以上を入力してください')
    .max(1000, 'レップ数は1000以内で入力してください'),
  memo: z.string().max(200, 'メモは200文字以内で入力してください').optional(),
});

export const workoutSessionSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: '日付の形式が正しくありません' })
      .refine(
        (val) => new Date(val) <= new Date(new Date().toISOString().slice(0, 10)),
        '未来の日付は入力できません'
      ),
    sets: z
      .array(workoutSetSchema)
      .min(1, '少なくとも1セット入力してください'),
  })
  .refine(
    (data) => {
      // 同一セッション内で (exercise_id, set_number) の組み合わせ重複を禁止する
      const keys = data.sets.map((s) => `${s.exercise_id}-${s.set_number}`);
      return keys.length === new Set(keys).size;
    },
    { message: '同一種目内でセット番号が重複しています' }
  );

export type WorkoutSetInput = z.infer<typeof workoutSetSchema>;
export type WorkoutSessionInput = z.infer<typeof workoutSessionSchema>;
